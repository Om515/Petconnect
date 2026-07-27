import { petOrder } from "../../Models/petModel.js";
import getDataUrl from "../../utils/urlGenerator.js";
import cloudinary from "cloudinary";

const sellPet = async (req, res) => {
  try {
    const { category, type, breed, age, description, price } = req.body;
    
    const file = req.file;
    if (!file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = getDataUrl(file);
    
    const cloud = await cloudinary.uploader.upload(fileUrl.content, {
      folder: "pets",
      resource_type: "image",
    });

    const petData = {
      category,
      type,
      breed,
      age,
      description,
      price,
      image: {
        id: cloud.public_id,
        url: cloud.secure_url,
      },
      owner: req.user._id,
    };

    const newPet = await petOrder.create(petData);

    res.status(201).json({
      message: "Product Added",
      product: newPet,
    });
  } catch (error) {
    console.log("Error in sellPet:", error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const buyPetList = async (req, res) => {
  try {
    const petContent = await petOrder.find({ isVerified: true, isApproved: true, soldBool: false }).populate("owner", "name email");
    res.json({ success: true, message: "Data fetched successfully", petContent });
  } catch (error) {
    console.log("Error in buyPetList ", error);
    res.json({ success: false, message: "Error" });
  }
};

const petInfo = async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.json({ success: false, message: "Id is required" });
    }

    const petDetails = await petOrder.findById(id).populate("owner", "name email mobile address");

    if (!petDetails) {
      return res.json({ success: false, message: "Pet Not Found" });
    }

    res.json({ success: true, message: "Data fetched successfully", petDetails });
  } catch (error) {
    console.error("Error in petInfo:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const bookPet = async (req, res) => {
  try {
    const petId = req.body.petId;
    const userId = req.user._id;
  
    if (!userId || !petId) {
      return res.json({ success: false, message: "userId or petId not found" });
    }
  
    const pet = await petOrder.findById(petId);
  
    if (!pet) {
      return res.json({ success: false, message: "Pet not found" });
    }

    if (userId.toString() === pet.owner.toString()) {
      return res.json({ success: false, message: "Owner and buyer are same" });
    }
  
    pet.soldBool = true;
    pet.buyer = userId;

    await pet.save();
  
    res.json({ success: true, message: "Pet successfully Booked" });
  } catch (error) {
    console.log("Error in bookPet: ", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

export { sellPet, buyPetList, petInfo, bookPet };
