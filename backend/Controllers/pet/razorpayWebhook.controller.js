import crypto from "crypto";
import PetRequest from "../../Models/petRequestModel.js";
import WebhookLog from "../../Models/webhookLogModel.js";
import Notification from "../../Models/notificationModel.js";

/**
 * STEP 9: RAZORPAY WEBHOOK HANDLER
 * Route: POST /api/user/razorpay/webhook
 * Header: x-razorpay-signature
 * Auth: Cryptographic HMAC Signature Verification
 */
export const handleRazorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({ success: false, message: "Missing x-razorpay-signature header" });
    }

    // 1. Verify Webhook Signature using RAZORPAY_WEBHOOK_SECRET
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const payload = req.rawBody ? req.rawBody : JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️ Invalid Razorpay Webhook Signature!");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    // 2. Parse Event Payload & Check Idempotency
    const event = req.body;
    const eventId = event.event_id || event.id || `${event.event}_${Date.now()}`;
    const eventType = event.event;

    // Idempotency check: Ignore duplicate webhook deliveries
    const existingLog = await WebhookLog.findOne({ eventId });
    if (existingLog) {
      console.log(`ℹ️ Razorpay Webhook Event ${eventId} already processed.`);
      return res.status(200).json({ status: "ok", message: "Event already processed" });
    }

    // Record webhook event ID
    await WebhookLog.create({ eventId, eventType });

    // 3. Process Specific Razorpay Events
    const entity = event.payload?.payment?.entity || event.payload?.refund?.entity;

    switch (eventType) {
      case "payment.authorized":
      case "payment.captured": {
        const paymentId = entity?.id;
        const orderId = entity?.order_id;

        if (orderId || paymentId) {
          const requestDoc = await PetRequest.findOne({
            $or: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }],
          });

          if (requestDoc && requestDoc.paymentStatus !== "Paid") {
            requestDoc.paymentStatus = "Paid";
            requestDoc.paymentVerified = true;
            requestDoc.paidAt = new Date();
            if (paymentId) requestDoc.razorpayPaymentId = paymentId;
            await requestDoc.save();

            // Notify owner if notification missing
            try {
              const notifDoc = await Notification.create({
                user: requestDoc.ownerId,
                type: "request_received",
                relatedUser: requestDoc.requesterId,
                pet: requestDoc.petId,
                requestId: requestDoc._id,
              });
              const { getIO } = await import("../../socket.js");
              getIO().to(requestDoc.ownerId.toString()).emit("notification", notifDoc);
            } catch (e) {}
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentId = entity?.id;
        const orderId = entity?.order_id;

        if (orderId || paymentId) {
          const requestDoc = await PetRequest.findOne({
            $or: [{ razorpayOrderId: orderId }, { razorpayPaymentId: paymentId }],
          });

          if (requestDoc && requestDoc.paymentStatus === "Pending") {
            requestDoc.paymentStatus = "Failed";
            await requestDoc.save();
          }
        }
        break;
      }

      case "refund.processed": {
        const refundId = entity?.id;
        const paymentId = entity?.payment_id;

        if (paymentId || refundId) {
          const requestDoc = await PetRequest.findOne({
            $or: [{ razorpayPaymentId: paymentId }, { razorpayRefundId: refundId }],
          });

          if (requestDoc) {
            requestDoc.paymentStatus = "Refunded";
            requestDoc.razorpayRefundId = refundId || requestDoc.razorpayRefundId;
            requestDoc.refundedAt = new Date();
            requestDoc.refundAmount = requestDoc.requestFee;
            await requestDoc.save();
          }
        }
        break;
      }

      case "refund.failed": {
        const refundId = entity?.id;
        const paymentId = entity?.payment_id;

        if (paymentId || refundId) {
          const requestDoc = await PetRequest.findOne({
            $or: [{ razorpayPaymentId: paymentId }, { razorpayRefundId: refundId }],
          });

          if (requestDoc) {
            requestDoc.paymentStatus = "RefundPending";
            await requestDoc.save();
            console.error(`🚨 Razorpay Refund Failed Event received for PetRequest ${requestDoc._id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return res.status(200).json({ status: "ok", message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error in handleRazorpayWebhook:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
