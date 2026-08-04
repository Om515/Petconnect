import mongoose from "mongoose";
import userModel from "./userModel.js";

const fileSchema = new mongoose.Schema(
  {
    id: String,
    url: String,
  },
  { _id: false }
);

const petOrderSchema = new mongoose.Schema(
  {
    // Legacy top-level fields for full backward compatibility
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      default: "Not specified",
    },
    weight: {
      type: String,
      default: "Not specified",
    },
    vaccinated: {
      type: String,
      default: "Unknown",
    },
    neutered: {
      type: String,
      default: "Unknown",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: fileSchema,
    soldBool: {
      type: Boolean,
      default: false,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // 1. Basic Information
    basicInfo: {
      name: { type: String, default: "" },
      category: { type: String, default: "" },
      type: { type: String, default: "" },
      breed: { type: String, default: "" },
      gender: { type: String, default: "Not specified" },
      age: { type: Number, default: 0 },
      dob: { type: String, default: "" },
      color: { type: String, default: "" },
      weight: { type: String, default: "" },
      listingType: { type: String, enum: ["Sale", "Adoption"], default: "Sale" },
      price: { type: Number, default: 0 },
      adoptionFee: { type: Number, default: 0 },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },

    // 2. Personality
    personality: {
      temperament: [{ type: String }],
      goodWith: [{ type: String }],
      training: [{ type: String }],
    },

    // 3. Health
    health: {
      vaccinationStatus: { type: String, default: "Unknown" },
      dewormed: { type: String, default: "Unknown" },
      microchipped: { type: String, default: "Unknown" },
      neutered: { type: String, default: "Unknown" },
      medicalConditions: [{ type: String }],
      currentMedications: [{ type: String }],
      allergies: [{ type: String }],
    },

    // 4. Lifestyle
    lifestyle: {
      livingStyle: { type: String, default: "" },
      exerciseRequirement: { type: String, default: "" },
      diet: { type: String, default: "" },
      groomingNeeds: { type: String, default: "" },
      energyLevel: { type: String, default: "" },
    },

    // 5. History
    history: {
      reasonForRehoming: { type: String, default: "" },
      birthDate: { type: String, default: "" },
      adoptionDate: { type: String, default: "" },
      previousOwner: { type: String, default: "" },
      petStory: { type: String, default: "" },
    },

    // 6. Media
    media: {
      coverPhoto: fileSchema,
      gallery: [fileSchema],
      videos: [fileSchema],
    },

    // 7. Documents
    documents: {
      vaccinationCertificate: fileSchema,
      medicalRecord: fileSchema,
      registrationCertificate: fileSchema,
      pedigreeCertificate: fileSchema,
      ownershipProof: fileSchema,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save synchronization hook to keep legacy top-level fields and nested fields consistent
petOrderSchema.pre("save", function (next) {
  // Sync basicInfo to top level
  if (this.basicInfo) {
    if (this.basicInfo.category) this.category = this.basicInfo.category;
    if (this.basicInfo.type) this.type = this.basicInfo.type;
    if (this.basicInfo.breed) this.breed = this.basicInfo.breed;
    if (this.basicInfo.age !== undefined) this.age = this.basicInfo.age;
    if (this.basicInfo.gender) this.gender = this.basicInfo.gender;
    if (this.basicInfo.weight) this.weight = this.basicInfo.weight;
    if (this.basicInfo.price !== undefined) this.price = this.basicInfo.price;
  } else {
    this.basicInfo = {
      category: this.category,
      type: this.type,
      breed: this.breed,
      age: this.age,
      gender: this.gender,
      weight: this.weight,
      price: this.price,
      listingType: "Sale",
    };
  }

  // Sync health to top level
  if (this.health) {
    if (this.health.vaccinationStatus) this.vaccinated = this.health.vaccinationStatus;
    if (this.health.neutered) this.neutered = this.health.neutered;
  }

  // Sync description to petStory
  if (this.history && this.history.petStory) {
    this.description = this.history.petStory;
  } else if (this.description && (!this.history || !this.history.petStory)) {
    if (!this.history) this.history = {};
    this.history.petStory = this.description;
  }

  // Sync media coverPhoto to top level image
  if (this.media && this.media.coverPhoto && this.media.coverPhoto.url) {
    this.image = this.media.coverPhoto;
  } else if (this.image && this.image.url && (!this.media || !this.media.coverPhoto || !this.media.coverPhoto.url)) {
    if (!this.media) this.media = {};
    this.media.coverPhoto = this.image;
  }

  next();
});

export const petOrder = mongoose.model("PetOrder", petOrderSchema);