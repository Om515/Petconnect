import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ImageModel =
  mongoose.models.ImageModel || mongoose.model("ImageModel", imageSchema);
