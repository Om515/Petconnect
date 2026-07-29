import mongoose from "mongoose";

const bookingRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const BookingRequest = mongoose.model("BookingRequest", bookingRequestSchema);