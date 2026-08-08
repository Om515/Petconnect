import PetRequest from "../../Models/petRequestModel.js";
import { petOrder } from "../../Models/petModel.js";
import Notification from "../../Models/notificationModel.js";
import Conversation from "../../Models/conversationModel.js";
import razorpayInstance from "../../Config/razorpay.js";

/**
 * Helper: Process Razorpay refund safely for a given PetRequest
 */
export const processRequestRefund = async (requestDoc) => {
  if (["Refunded", "RefundPending"].includes(requestDoc.paymentStatus)) {
    return requestDoc.paymentStatus;
  }

  // Set requestStatus to Rejected
  requestDoc.requestStatus = "Rejected";

  // Real Razorpay verified payment check
  if (
    requestDoc.paymentStatus === "Paid" &&
    requestDoc.paymentVerified &&
    requestDoc.razorpayPaymentId &&
    !requestDoc.fakePayment
  ) {
    try {
      const refundFeeInPaise = Math.round(Number(requestDoc.requestFee) * 100);
      const refund = await razorpayInstance.payments.refund(requestDoc.razorpayPaymentId, {
        amount: refundFeeInPaise,
        notes: {
          petRequestId: requestDoc._id.toString(),
          petId: requestDoc.petId.toString(),
          reason: "Pet Request Rejected",
        },
      });

      if (refund && refund.id) {
        requestDoc.paymentStatus = "Refunded";
        requestDoc.razorpayRefundId = refund.id;
        requestDoc.refundedAt = new Date();
        requestDoc.refundAmount = requestDoc.requestFee;
      } else {
        requestDoc.paymentStatus = "RefundPending";
      }
    } catch (refundErr) {
      console.error(`🚨 Razorpay Refund API Error for PetRequest ${requestDoc._id}:`, refundErr?.message || refundErr);
      requestDoc.paymentStatus = "RefundPending";
    }
  } else {
    // For legacy/fake test payments or unpaid requests:
    if (requestDoc.paymentStatus === "Paid") {
      requestDoc.paymentStatus = "Refunded";
      requestDoc.refundedAt = new Date();
      requestDoc.refundAmount = requestDoc.requestFee;
    }
  }

  await requestDoc.save();
  return requestDoc.paymentStatus;
};

/**
 * API 1: CREATE REQUEST
 * Route: POST /api/user/pet-request
 */
export const createPetRequest = async (req, res) => {
  try {
    const { petId } = req.body;
    const requesterId = req.user._id;

    if (!petId) {
      return res.status(400).json({ success: false, message: "petId is required" });
    }

    // 1. Find the pet
    const pet = await petOrder.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Pet not found" });
    }

    // 2. Verify pet is approved & verified for marketplace
    if (!pet.isApproved || !pet.isVerified) {
      return res.status(400).json({ success: false, message: "Pet is not available for request yet" });
    }

    // 3. Verify pet is not already sold
    if (pet.soldBool) {
      return res.status(400).json({ success: false, message: "Pet has already been sold/adopted" });
    }

    // 4. Verify requester is not the owner
    if (pet.owner.toString() === requesterId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot request your own pet" });
    }

    // 5. Determine ownerId and listingType from pet document
    const ownerId = pet.owner;
    const listingType = pet.basicInfo?.listingType || (Number(pet.price) > 0 ? "Sale" : "Adoption");

    // 6. Determine request fee (ENV or default 300)
    const requestFee = Number(process.env.PET_REQUEST_FEE) || 300;

    // 7. Check whether this buyer already has an active request (Pending or Accepted) for this pet
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

    // 8. Simulate payment (Paid, fakePayment = true) and create request
    const newRequest = await PetRequest.create({
      petId,
      ownerId,
      requesterId,
      listingType,
      requestStatus: "Pending",
      paymentStatus: "Paid",
      fakePayment: true,
      requestFee,
    });

    // 9. Create Notification for Pet Owner
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
      console.error("Socket/Notification creation error on createPetRequest:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Pet request created successfully",
      petRequest: newRequest,
    });
  } catch (error) {
    console.error("Error in createPetRequest:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * Helper: Check & auto-refund pending requests if owner didn't respond within expiration timeframe (default 48 hours)
 */
export const checkAndProcessExpiredRequests = async () => {
  try {
    const expiryHours = Number(process.env.PET_REQUEST_EXPIRY_HOURS) || 48;
    const cutoffDate = new Date(Date.now() - expiryHours * 60 * 60 * 1000);

    const expiredRequests = await PetRequest.find({
      requestStatus: "Pending",
      createdAt: { $lt: cutoffDate },
    });

    if (expiredRequests.length > 0) {
      for (const reqDoc of expiredRequests) {
        await processRequestRefund(reqDoc);

        try {
          const notifDoc = await Notification.create({
            user: reqDoc.requesterId,
            type: "request_rejected",
            relatedUser: reqDoc.ownerId,
            pet: reqDoc.petId,
            requestId: reqDoc._id,
          });

          const { getIO } = await import("../../socket.js");
          getIO().to(reqDoc.requesterId.toString()).emit("notification", notifDoc);
        } catch (e) {}
      }
    }
  } catch (err) {
    console.error("Error in checkAndProcessExpiredRequests:", err);
  }
};

/**
 * API 2: BUYER REQUESTS
 * Route: GET /api/user/pet-requests
 */
export const getBuyerPetRequests = async (req, res) => {
  try {
    await checkAndProcessExpiredRequests();
    const requesterId = req.user._id;

    const petRequests = await PetRequest.find({ requesterId })
      .populate("petId", "breed category type image media price basicInfo soldBool isApproved isVerified owner")
      .populate("ownerId", "name email mobile address")
      .sort({ createdAt: -1 });

    const requestsWithConvo = await Promise.all(
      petRequests.map(async (r) => {
        const doc = r.toObject();
        if (doc.requestStatus === "Accepted" && !doc.conversationId && doc.petId) {
          const petIdVal = doc.petId._id || doc.petId;
          const ownerIdVal = doc.ownerId?._id || doc.ownerId;
          if (ownerIdVal) {
            let convo = await Conversation.findOne({
              pet: petIdVal,
              participants: { $all: [requesterId, ownerIdVal] },
            });
            if (!convo) {
              convo = await Conversation.create({
                participants: [requesterId, ownerIdVal],
                pet: petIdVal,
                petRequestId: doc._id,
              });
            }
            if (convo) {
              doc.conversationId = convo._id;
              r.conversationId = convo._id;
              await r.save();
            }
          }
        }
        return doc;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Buyer pet requests retrieved successfully",
      petRequests: requestsWithConvo,
    });
  } catch (error) {
    console.error("Error in getBuyerPetRequests:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 3: OWNER REQUESTS
 * Route: GET /api/user/owner-pet-requests
 */
export const getOwnerPetRequests = async (req, res) => {
  try {
    await checkAndProcessExpiredRequests();
    const ownerId = req.user._id;

    const petRequests = await PetRequest.find({ ownerId })
      .populate("petId", "breed category type image media price basicInfo soldBool isApproved isVerified owner")
      .populate("requesterId", "name email mobile address")
      .sort({ createdAt: -1 });

    const requestsWithConvo = await Promise.all(
      petRequests.map(async (r) => {
        const doc = r.toObject();
        if (doc.requestStatus === "Accepted" && !doc.conversationId && doc.petId) {
          const petIdVal = doc.petId._id || doc.petId;
          const reqIdVal = doc.requesterId?._id || doc.requesterId;
          if (reqIdVal) {
            let convo = await Conversation.findOne({
              pet: petIdVal,
              participants: { $all: [reqIdVal, ownerId] },
            });
            if (!convo) {
              convo = await Conversation.create({
                participants: [reqIdVal, ownerId],
                pet: petIdVal,
                petRequestId: doc._id,
              });
            }
            if (convo) {
              doc.conversationId = convo._id;
              r.conversationId = convo._id;
              await r.save();
            }
          }
        }
        return doc;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Owner pet requests retrieved successfully",
      petRequests: requestsWithConvo,
    });
  } catch (error) {
    console.error("Error in getOwnerPetRequests:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 4: ACCEPT REQUEST
 * Route: PATCH /api/user/pet-request/:requestId/accept
 */
export const acceptPetRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await PetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Pet request not found" });
    }

    // 1. Verify authenticated user is ownerId
    if (request.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: Only the pet owner can accept this request" });
    }

    // 2. Verify request is currently Pending
    if (request.requestStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept request with status '${request.requestStatus}'`,
      });
    }

    // 3. Verify pet is not already sold
    const pet = await petOrder.findById(request.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Associated pet not found" });
    }
    if (pet.soldBool) {
      return res.status(400).json({ success: false, message: "Pet has already been sold/adopted" });
    }

    // 4. Verify no other request for this pet is already Accepted
    const existingAccepted = await PetRequest.findOne({
      petId: request.petId,
      requestStatus: "Accepted",
      _id: { $ne: requestId },
    });

    if (existingAccepted) {
      return res.status(400).json({
        success: false,
        message: "Another request has already been accepted for this pet",
      });
    }

    // 5. Atomically update the selected request status to Accepted if it is still Pending
    const acceptedRequest = await PetRequest.findOneAndUpdate(
      {
        _id: requestId,
        ownerId: userId,
        requestStatus: "Pending",
      },
      {
        $set: { requestStatus: "Accepted" },
      },
      { new: true }
    );

    if (!acceptedRequest) {
      return res.status(400).json({
        success: false,
        message: "Request is no longer pending or already processed",
      });
    }

    // 6. Find or create the conversation for buyer-owner for this pet
    let conversation = await Conversation.findOne({
      pet: request.petId,
      participants: { $all: [acceptedRequest.requesterId, userId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [acceptedRequest.requesterId, userId],
        pet: request.petId,
        petRequestId: acceptedRequest._id,
      });
    }

    acceptedRequest.conversationId = conversation._id;
    await acceptedRequest.save();

    // 7. Find all OTHER Pending requests for the SAME pet and set requestStatus = Rejected, paymentStatus = Refunded
    const otherPendingRequests = await PetRequest.find({
      petId: request.petId,
      _id: { $ne: requestId },
      requestStatus: "Pending",
    });

    if (otherPendingRequests.length > 0) {
      // Process Razorpay refund and notification for each auto-rejected buyer
      for (const otherReq of otherPendingRequests) {
        await processRequestRefund(otherReq);
        try {
          const notifDoc = await Notification.create({
            user: otherReq.requesterId,
            type: "request_rejected",
            relatedUser: userId,
            pet: request.petId,
            requestId: otherReq._id,
          });

          const { getIO } = await import("../../socket.js");
          getIO().to(otherReq.requesterId.toString()).emit("notification", notifDoc);
        } catch (notifErr) {
          console.error("Socket/Notification error on auto-reject:", notifErr);
        }
      }
    }

    // 8. Create Notification & emit real-time WebSockets event for the Accepted Buyer
    try {
      const notifDoc = await Notification.create({
        user: acceptedRequest.requesterId,
        type: "request_accepted",
        relatedUser: userId,
        pet: acceptedRequest.petId,
        requestId: acceptedRequest._id,
        conversationId: conversation._id,
      });

      const { getIO } = await import("../../socket.js");
      getIO().to(acceptedRequest.requesterId.toString()).emit("notification", notifDoc);
    } catch (notifErr) {
      console.error("Socket/Notification creation error on acceptPetRequest:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Pet request accepted successfully and competing pending requests rejected",
      petRequest: acceptedRequest,
      conversationId: conversation._id,
      autoRejectedCount: otherPendingRequests.length,
    });
  } catch (error) {
    console.error("Error in acceptPetRequest:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 5: REJECT REQUEST
 * Route: PATCH /api/user/pet-request/:requestId/reject
 */
export const rejectPetRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await PetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Pet request not found" });
    }

    // 1. Verify authenticated user is ownerId
    if (request.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: Only the pet owner can reject this request" });
    }

    // 2. Verify request is not already Completed or Rejected
    if (["Completed", "Rejected"].includes(request.requestStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status '${request.requestStatus}'`,
      });
    }

    // 3. Process Razorpay / system refund and set requestStatus to Rejected
    await processRequestRefund(request);

    // 4. Create Notification & emit real-time WebSockets event for the Buyer
    try {
      const notifDoc = await Notification.create({
        user: request.requesterId,
        type: "request_rejected",
        relatedUser: request.ownerId,
        pet: request.petId,
        requestId: request._id,
      });

      const { getIO } = await import("../../socket.js");
      getIO().to(request.requesterId.toString()).emit("notification", notifDoc);
    } catch (notifErr) {
      console.error("Socket/Notification creation error on rejectPetRequest:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Pet request rejected successfully",
      petRequest: request,
    });
  } catch (error) {
    console.error("Error in rejectPetRequest:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * API 6: COMPLETE REQUEST
 * Route: PATCH /api/user/pet-request/:requestId/complete
 */
export const completePetRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    // 1. Find pet request
    const request = await PetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Pet request not found" });
    }

    // 2. Verify authenticated user is ownerId
    if (request.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only the pet owner can complete this request",
      });
    }

    // 3. Verify request status is Accepted
    if (request.requestStatus !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: `Only Accepted requests can be completed. Current status: '${request.requestStatus}'`,
      });
    }

    // 4. Find associated pet
    const pet = await petOrder.findById(request.petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: "Associated pet not found" });
    }

    // 5. Update Pet Model state: set soldBool = true and buyer = requesterId
    pet.soldBool = true;
    pet.buyer = request.requesterId;
    await pet.save();

    // 6. Update Accepted PetRequest status to Completed
    request.requestStatus = "Completed";
    await request.save();

    // 7. Safety check: close any remaining Pending requests for the same pet
    const remainingPending = await PetRequest.find({
      petId: request.petId,
      _id: { $ne: requestId },
      requestStatus: "Pending",
    });

    if (remainingPending.length > 0) {
      for (const remReq of remainingPending) {
        await processRequestRefund(remReq);
      }
    }

    // 8. Create notification for buyer & emit real-time WebSockets event
    try {
      const notifDoc = await Notification.create({
        user: request.requesterId,
        type: "request_accepted",
        relatedUser: userId,
        pet: request.petId,
        requestId: request._id,
      });

      const { getIO } = await import("../../socket.js");
      getIO().to(request.requesterId.toString()).emit("notification", notifDoc);
    } catch (notifErr) {
      console.error("Socket error on completePetRequest:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: `Pet transaction marked as completed (${request.listingType === 'Sale' ? 'Sold' : 'Adopted'}) successfully`,
      petRequest: request,
      pet,
    });
  } catch (error) {
    console.error("Error in completePetRequest:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
