import mongoose from "mongoose";

const caretakerApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String, // Added mobile number
      required: true,
    },
    experience: {
      type: Number, // years of experience
      required: true,
    },
    skills: {
      type: [String], // array of skills like ["Dog Walking", "Grooming"]
      required: true,
    },
    availability: {
      type: String, // "Full-time", "Part-time", etc.
      required: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker", // Changed to "Caretaker" to match your original model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CaretakerApplication = mongoose.model("CaretakerApplication", caretakerApplicationSchema);