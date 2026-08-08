import mongoose from "mongoose";

const webhookLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WebhookLog =
  mongoose.models.WebhookLog || mongoose.model("WebhookLog", webhookLogSchema);

export { WebhookLog };
export default WebhookLog;
