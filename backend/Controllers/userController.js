// backend/Controllers/userController.js
import userModel from "../Models/userModel.js";
import { CaretakerApplication } from "../Models/caretakerApplicationModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import getDataUrl from "../utils/urlGenerator.js";
import cloudinary from "cloudinary";
import { petOrder } from "../Models/petModel.js";
import { BookingRequest } from "../Models/bookingRequestModel.js";
import caretakerModel from "../Models/caretakerModel.js";

// Existing functions (DO NOT MODIFY)
const createWebToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("user_token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password or email" });
    }

    createWebToken(user, res);
    res.json({ success: true, user, message: "Logged In" });
  } catch (error) {
    console.log("Error in userController login : ", error);
    res.json({ success: false, message: "Error" });
  }
};

const registerUser = async (req, res) => {
  const { name, mobile, address, email, password } = req.body;

  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter valid email" });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Please Enter strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      password: hashedPassword,
    });

    const user = await newUser.save();
    createWebToken(user, res);
    res.json({ success: true, user, message: "Registered Successfully" });
  } catch (error) {
    console.log("userController registerUser error: ", error);
    res.json({ success: false, message: "Error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("user_token", "", { maxAge: 0 });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout :", error);
    res.json({ message: false, message: "Error" });
  }
};

const myProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: "Error" });
    console.log("Error in myProfile", error);
  }
};

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

const userAllInfo = async (req, res) => {
  try {
    const id = req.user._id;
  
    if (!id) {
      return res.json({ success: false, message: "Id not found" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.json({ success: false, message: "User not Found" });
    }
    
    const myPetDetails = await petOrder.find({ owner: id });
    
    if (!myPetDetails) {
      return res.json({ success: false, message: "Pets not Found" });
    }
    
    const buyPetDetails = await petOrder.find({ soldBool: true, buyer: id });
    
    if (!buyPetDetails) {
      return res.json({ success: false, message: "Pets not Found" });
    }
  
    res.json({ success: true, user, myPetDetails, buyPetDetails, message: "Data feted successfully" });
  } catch (error) {
    console.log("Error in userPetInfo : ", error);
    res.json({ success: false, message: "Error" });
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

const CaretakerList = async (req, res) => {
  try {
    const CaretakerContent = await CaretakerApplication.find().populate("applicant", "email");
    res.json({ success: true, message: "Data fetched successfully", CaretakerContent });
  } catch (error) {
    console.log("Error in CaretakerList ", error);
    res.json({ success: false, message: "Error" });
  }
};

const getCaretakerProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const caretaker = await CaretakerApplication.findById(req.params.id)
      .populate("applicant", "name email mobile");
    
    if (!caretaker) {
      return res.status(404).json({ 
        success: false, 
        message: "Caretaker not found" 
      });
    }

    res.json({ 
      success: true, 
      caretaker 
    });
  } catch (error) {
    console.error("Error in getCaretakerProfile:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Updated createBookingRequest
const createBookingRequest = async (req, res) => {
  try {
    const { caretakerId, service, date, hours } = req.body;
    const userId = req.user._id;

    console.log("Creating booking request:", { caretakerId, service, date, hours, userId });

    // Validate input
    if (!caretakerId || !service || !date || !hours) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let finalCaretakerId;
    let hourlyRate;

    // Try caretakerId as Caretaker _id
    const caretaker = await caretakerModel.findById(caretakerId);
    if (caretaker) {
      console.log("Found Caretaker directly:", caretaker._id);
      // Find associated CaretakerApplication for hourlyRate
      const application = await CaretakerApplication.findOne({ applicant: caretakerId });
      if (!application) {
        console.log("No CaretakerApplication found for Caretaker ID:", caretakerId);
        return res.status(404).json({ success: false, message: "Caretaker application not found" });
      }
      finalCaretakerId = caretaker._id;
      hourlyRate = application.hourlyRate;
    } else {
      // Try caretakerId as CaretakerApplication _id
      console.log("Caretaker not found, trying CaretakerApplication:", caretakerId);
      const application = await CaretakerApplication.findById(caretakerId).populate("applicant");
      if (!application) {
        console.log("CaretakerApplication not found for ID:", caretakerId);
        return res.status(404).json({ success: false, message: "Caretaker application not found" });
      }
      if (!application.applicant || !application.applicant._id) {
        console.log("No applicant found in CaretakerApplication:", application);
        return res.status(404).json({ success: false, message: "Caretaker not found" });
      }
      const applicantCaretaker = await caretakerModel.findById(application.applicant._id);
      if (!applicantCaretaker) {
        console.log("Caretaker not found for applicant ID:", application.applicant._id);
        return res.status(404).json({ success: false, message: "Caretaker not found" });
      }
      finalCaretakerId = application.applicant._id;
      hourlyRate = application.hourlyRate;
    }

    // Validate date
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookingDate) || bookingDate < today) {
      return res.status(400).json({ success: false, message: "Invalid or past date" });
    }

    // Validate hours
    if (!Number.isInteger(Number(hours)) || hours < 1) {
      return res.status(400).json({ success: false, message: "Hours must be a positive integer" });
    }

    // Calculate total cost
    const totalCost = hours * (hourlyRate || 0);

    // Create booking request
    const bookingRequest = new BookingRequest({
      user: userId,
      caretaker: finalCaretakerId,
      service,
      date: bookingDate,
      hours: Number(hours),
      totalCost,
      status: "pending",
    });

    await bookingRequest.save();

    res.json({ success: true, message: "Booking request sent successfully" });
  } catch (error) {
    console.error("Error creating booking request:", error);
    res.status(500).json({ success: false, message: `Error creating booking request: ${error.message}` });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await userModel.findById(id).select("name email").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const bookingRequests = await BookingRequest.find({ user: id })
      .populate("caretaker", "name email")
      .select("service date hours totalCost status createdAt")
      .lean();

    const bookingData = bookingRequests.map(booking => ({
      _id: booking._id,
      service: booking.service,
      date: booking.date,
      hours: booking.hours,
      totalCost: booking.totalCost,
      status: booking.status,
      createdAt: booking.createdAt,
      caretaker: booking.caretaker || { name: "Unknown", email: "N/A" },
    }));

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        bookingRequests: bookingData,
      },
    });
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};

const updateUser = async(req,res) => {
  try{
    const {email,name,mobile} = req.body;
    
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({ success:false, message:"No user with this email" })
    }
    
    user.name =name;
    user.mobile = mobile;
    
    await user.save();
    res.json({ success:true, message:"ser updated successfully"});

  }catch(error){
    console.log("Error in update user ", error)
    res.status(400).json({
      message:"Error"
    })
  }
}


const updateAddress = async(req,res) =>{
  try {
    const {address} = req.body;

    const userId = req.user._id;

    if(!userId){
      return res.json({ success:false, message:"User Id not found"});
    }

    const user = await userModel.findById(userId);

    if(!user){
      return res.json({ success:false, message:"User not found"});
    }

    user.address = address;

    await user.save();

    res.json({ success:true, message:"Address updated successfully"});
  } catch (error) {
    console.log("Error in updateAddress :",error);
    res.json({ success:FontFaceSetLoadEvent, message:"Internal server Error"});
  }
}

export {
  loginUser,
  registerUser,
  logoutUser,
  myProfile,
  sellPet,
  buyPetList,
  petInfo,
  userAllInfo,
  bookPet,
  CaretakerList,
  getCaretakerProfile,
  createBookingRequest,
  getUserBookings,
  updateAddress,
  updateUser
};