import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    petRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetRequest",
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PetOrder",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000,
      trim: true,
    },
    reviewType: {
      type: String,
      enum: ["BuyerToOwner", "OwnerToBuyer"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Ensures a reviewer can submit only ONE review per direction
// (BuyerToOwner or OwnerToBuyer) for a given completed PetRequest transaction.
reviewSchema.index(
  { petRequestId: 1, reviewerId: 1, reviewType: 1 },
  { unique: true }
);

const Review =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);

export { Review };
export default Review;
