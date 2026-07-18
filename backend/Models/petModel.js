import mongoose from "mongoose";
import userModel from "./userModel.js";

const petOrderSchema = new mongoose.Schema(
  {
    category:{
      type: String,
      required: true,
    },
    type:{
      type: String,
      required: true,
    },
    breed:{
      type: String,
      required: true,
    },
    age:{
      type: Number,
      required: true,
    },
    description:{
      type: String,
      required: true,
    },
    price:{
      type: Number,
      required: true,
    },
    isVerified:{
      type: Boolean,
      default: false,
    },
    isApproved:{
      type: Boolean,
      default: false
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    image:{
      id: String,
      url: String,
    },
    soldBool:{
      type: Boolean,
      default: false,
    },
    buyer:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
    }
  },
  {
    timestamps: true
  }
);

export const petOrder = mongoose.model("PetOrder",petOrderSchema)