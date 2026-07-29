import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    unit: { type: String, default: "per hour" },
  },
  { _id: false }
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, default: "" },
    year: { type: Number },
    credentialUrl: { type: String, default: "" },
  },
  { _id: false }
);

const galleryItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const caretakerProfileSchema = new mongoose.Schema(
  {
    caretaker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "archived"],
      default: "draft",
      index: true,
    },

    // 1. Profile Header
    headline: { type: String, trim: true, default: "" },
    profileImage: { type: String, default: "" },
    coverBanner: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },

    // 2. About Me
    bio: { type: String, default: "" },
    petOwnershipHistory: { type: String, default: "" },

    // 3. Professional Information
    yearsOfExperience: { type: Number, default: 0 },
    experienceCount: { type: Number, default: 0 }, // Number of pets cared for / assignments
    languages: [{ type: String }],                // Languages spoken (e.g. English, Spanish, Hindi)
    responseTime: { type: String, default: "Within 1 hour" },
    hasEmergencyTransport: { type: Boolean, default: false },
    isBackgroundChecked: { type: Boolean, default: false },

    // 4. Services Offered & Pricing
    services: [serviceItemSchema],
    baseDailyRate: { type: Number, default: 0 },
    additionalPetRate: { type: Number, default: 0 },
    holidayRate: { type: Number, default: 0 },

    // 5. Availability Calendar & Schedule
    availabilityDays: [
      {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
    ],
    operatingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "20:00" },
    },
    isAcceptingNewClients: { type: Boolean, default: true },

    // 6. Trust Badges & Skills
    trustBadges: [{ type: String }],
    skills: [{ type: String }],

    // 7. Pet Types & Preferences
    acceptedPetTypes: [{ type: String }],
    acceptedDogSizes: [{ type: String }],

    // 8. Experience Gallery
    gallery: [galleryItemSchema],

    // 9. Home Environment & Safety Information
    homeEnvironment: {
      housingType: { type: String, enum: ["House", "Apartment", "Townhouse", "Condo"], default: "House" },
      yardType: { type: String, enum: ["Fenced Yard", "Unfenced Yard", "No Yard"], default: "Fenced Yard" },
      hasOwnPets: { type: Boolean, default: false },
      hasChildren: { type: Boolean, default: false },
      nonSmokingHome: { type: Boolean, default: true },
    },
    safetyInfo: {
      emergencyVetContact: { type: String, default: "" },
      hasFirstAidKit: { type: Boolean, default: true },
      insured: { type: Boolean, default: false },
    },

    // 10. Certifications
    certifications: [certificationSchema],

    // Admin audit fields
    rejectionReason: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

caretakerProfileSchema.index({ caretaker: 1, status: 1 });

export const CaretakerProfile =
  mongoose.models.CaretakerProfile || mongoose.model("CaretakerProfile", caretakerProfileSchema);
