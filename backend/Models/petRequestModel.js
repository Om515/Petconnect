import mongoose from "mongoose";

const petRequestSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetOrder",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    listingType: {
      type: String,
      enum: ["Sale", "Adoption"],
      required: true,
    },
    requestStatus: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed", "Withdrawn"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "RefundPending", "Refunded"],
      default: "Pending",
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    requestFee: {
      type: Number,
      required: true,
    },
    fakePayment: {
      type: Boolean,
      default: false,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  {
    timestamps: true,
  }
);

// Database-level enforcement: Prevents a buyer (requesterId) from having 
// multiple active requests ("Pending" or "Accepted") for the same pet (petId).
petRequestSchema.index(
  { requesterId: 1, petId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      requestStatus: { $in: ["Pending", "Accepted"] },
    },
  }
);

const PetRequest =
  mongoose.models.PetRequest || mongoose.model("PetRequest", petRequestSchema);

export { PetRequest };
export default PetRequest;
