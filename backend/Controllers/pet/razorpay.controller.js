import razorpayInstance from "../../Config/razorpay.js";
import PetRequest from "../../Models/petRequestModel.js";
import { petOrder } from "../../Models/petModel.js";
import Notification from "../../Models/notificationModel.js";
import crypto from "crypto";

/**
 * STEP 3: CREATE RAZORPAY ORDER
 * Route: POST /api/user/razorpay/create-order
 * Request Body: { petId }
 * Auth: Protected (isAuth)
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { petId } = req.body;
    const requesterId = req.user._id;

    // 1. Validate petId presence
    if (!petId) {
      return res.status(400).json({ success: false, message: "petId is required" });
    }

    // 2. Find the pet
    const pet = await petOrder.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    // 3. Verify pet is approved & verified for marketplace
    if (!pet.isApproved || !pet.isVerified) {
      return res.status(400).json({ success: false, message: "Pet is not available for request yet" });
    }

    // 4. Verify pet is not sold/adopted
    if (pet.soldBool) {
      return res.status(400).json({ success: false, message: "Pet has already been sold/adopted" });
    }

    // 5. Verify requester is not the pet owner
    if (pet.owner.toString() === requesterId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot request your own pet" });
    }

    // 6. Check duplicate active request (Pending or Accepted)
    const existingActiveRequest = await PetRequest.findOne({
      requesterId,
      petId,
      requestStatus: { $in: ["Pending", "Accepted"] },
    });

    if (existingActiveRequest) {
      return res.status(400).json({
        success: false,
        message: `You already have an active request (${existingActiveRequest.requestStatus}) for this pet`,
      });
    }

    // 7. Get fee amount from backend ENV (default ₹300)
    const requestFee = Number(process.env.PET_REQUEST_FEE) || 300;
    const amountInPaise = Math.round(requestFee * 100); // 300 INR = 30000 paise

    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      return res.status(500).json({ success: false, message: "Invalid request fee configuration" });
    }

    // 8. Create Razorpay Order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_pet_${petId.toString().slice(-6)}_${Date.now()}`,
      notes: {
        petId: petId.toString(),
        requesterId: requesterId.toString(),
        ownerId: pet.owner.toString(),
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    if (!razorpayOrder || !razorpayOrder.id) {
      return res.status(500).json({ success: false, message: "Failed to create order with Razorpay" });
    }

    // 9. Return Order payload for frontend Razorpay Checkout
    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      requestFee,
      petId,
    });
  } catch (error) {
    console.error("Error in createRazorpayOrder:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while creating Razorpay order",
    });
  }
};

/**
 * STEP 5: VERIFY RAZORPAY PAYMENT & CREATE PET REQUEST
 * Route: POST /api/user/razorpay/verify-payment
 * Request Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, petId }
 * Auth: Protected (isAuth)
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, petId } = req.body;
    const requesterId = req.user._id;

    // 1. Payload validation
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !petId) {
      return res.status(400).json({
        success: false,
        paymentVerified: false,
        message: "razorpay_payment_id, razorpay_order_id, razorpay_signature, and petId are required",
      });
    }

    // 2. Duplicate Verification Check (Idempotency)
    const existingPaymentReq = await PetRequest.findOne({
      $or: [{ razorpayPaymentId: razorpay_payment_id }, { razorpayOrderId: razorpay_order_id }],
    });

    if (existingPaymentReq) {
      return res.status(200).json({
        success: true,
        paymentVerified: true,
        message: "Payment already verified previously",
        petRequest: existingPaymentReq,
      });
    }

    // 3. Cryptographic Signature Verification (HMAC-SHA256)
    const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyStr.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        paymentVerified: false,
        message: "Payment verification failed: Invalid cryptographic signature",
      });
    }

    // 4. Verify Razorpay Order Details & Notes Ownership
    let orderDetails;
    try {
      orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
    } catch (orderErr) {
      console.warn("Could not fetch Razorpay order details directly:", orderErr.message);
    }

    if (orderDetails) {
      // Verify Order Amount matches server-configured PET_REQUEST_FEE (30000 paise)
      const expectedFee = Number(process.env.PET_REQUEST_FEE) || 300;
      const expectedPaise = Math.round(expectedFee * 100);
      if (orderDetails.amount !== expectedPaise) {
        return res.status(400).json({
          success: false,
          paymentVerified: false,
          message: "Payment verification failed: Order fee amount mismatch",
        });
      }

      // Verify Buyer Ownership of Order Notes
      if (orderDetails.notes?.requesterId && orderDetails.notes.requesterId !== requesterId.toString()) {
        return res.status(403).json({
          success: false,
          paymentVerified: false,
          message: "Unauthorized: Razorpay order belongs to a different buyer",
        });
      }
    }

    // 5. Verify Pet details & active request guards
    const pet = await petOrder.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, paymentVerified: false, message: "Pet not found" });
    }

    if (!pet.isApproved || !pet.isVerified || pet.soldBool) {
      return res.status(400).json({ success: false, paymentVerified: false, message: "Pet is no longer available" });
    }

    if (pet.owner.toString() === requesterId.toString()) {
      return res.status(400).json({ success: false, paymentVerified: false, message: "You cannot request your own pet" });
    }

    const existingActiveRequest = await PetRequest.findOne({
      requesterId,
      petId,
      requestStatus: { $in: ["Pending", "Accepted"] },
    });

    if (existingActiveRequest) {
      return res.status(400).json({
        success: false,
        paymentVerified: true,
        message: `You already have an active request (${existingActiveRequest.requestStatus}) for this pet`,
        petRequest: existingActiveRequest,
      });
    }

    const ownerId = pet.owner;
    const listingType = pet.basicInfo?.listingType || (Number(pet.price) > 0 ? "Sale" : "Adoption");
    const requestFee = Number(process.env.PET_REQUEST_FEE) || 300;

    // 6. Create PetRequest with paymentStatus = Paid, fakePayment = false, paymentVerified = true
    const newRequest = await PetRequest.create({
      petId,
      ownerId,
      requesterId,
      listingType,
      requestStatus: "Pending",
      paymentStatus: "Paid",
      paymentVerified: true,
      fakePayment: false,
      requestFee,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
    });

    // 7. Create Notification & emit Socket.io event for Pet Owner
    try {
      const notifDoc = await Notification.create({
        user: ownerId,
        type: "request_received",
        relatedUser: requesterId,
        pet: petId,
        requestId: newRequest._id,
      });

      const { getIO } = await import("../../socket.js");
      getIO().to(ownerId.toString()).emit("notification", notifDoc);
    } catch (notifErr) {
      console.error("Socket/Notification creation error on verifyRazorpayPayment:", notifErr);
    }

    return res.status(201).json({
      success: true,
      paymentVerified: true,
      message: "Payment verified and pet request created successfully",
      petRequest: newRequest,
    });
  } catch (error) {
    console.error("Error in verifyRazorpayPayment:", error);
    return res.status(500).json({
      success: false,
      paymentVerified: false,
      message: error.message || "An error occurred during payment verification",
    });
  }
};
