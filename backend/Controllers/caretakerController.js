
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import caretakerModel from "../Models/caretakerModel.js";
import { BookingRequest } from "../Models/bookingRequestModel.js";
import { CaretakerApplication } from "../Models/caretakerApplicationModel.js";
import userModel from "../Models/userModel.js"; // Add this


const createWebToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("caretaker_token", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });
};


const loginCaretaker = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await caretakerModel.findOne({ email });

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


const registerCaretaker = async (req, res) => {
  const { name, mobile, address, email, password } = req.body;

  try {
    //checking user already exists or not
    const exists = await caretakerModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    //validing email and strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter valid email" });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Please Enter strong password",
      });
    }

    //hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new caretakerModel({
      name: name,
      email: email,
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


const logoutCaretaker = async (req, res) => {
  try {
    res.cookie("caretaker_token", "", { maxAge: 0 });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout :", error);
    res.json({ message: false, message: "Error" });
  }
};





// const myProfile = async (req, res) => {
//   try {
//     const id = req.user._id;
    
//     // Get base user info
//     const user = await caretakerModel.findById(id)
//       .select('name email')
//       .lean();

//     // Get application info if exists
//     const application = await CaretakerApplication.findOne({ applicant: id })
//       .select('fullName mobile experience skills availability hourlyRate description')
//       .lean();

//     // Combine data
//     const profileData = {
//       name: application?.fullName || user?.name || '',
//       email: user?.email || '',
//       mobile: application?.mobile || '',
//       experience: application?.experience || 0,
//       skills: application?.skills || [],
//       availability: application?.availability || 'Not specified',
//       hourlyRate: application?.hourlyRate || 0,
//       description: application?.description || '',
//       hasApplication: !!application
//     };

//     res.json({ success: true, user: profileData });
//   } catch (error) {
//     console.error("Profile error:", error);
//     res.status(500).json({ success: false, message: "Error fetching profile" });
//   }
// };


const myProfile = async (req, res) => {
  try {
    const id = req.user._id;

    // Get base user info
    const user = await caretakerModel.findById(id)
      .select("name email")
      .lean();

    // Get application info if exists
    const application = await CaretakerApplication.findOne({ applicant: id })
      .select("fullName mobile experience skills availability hourlyRate description")
      .lean();

    // Get booking requests
    const bookingRequests = await BookingRequest.find({ caretaker: id })
      .populate("user", "name email") // Populate user info
      .select("service date hours totalCost status createdAt")
      .lean();

    // Combine data
    const profileData = {
      name: application?.fullName || user?.name || "",
      email: user?.email || "",
      mobile: application?.mobile || "",
      experience: application?.experience || 0,
      skills: application?.skills || [],
      availability: application?.availability || "Not specified",
      hourlyRate: application?.hourlyRate || 0,
      description: application?.description || "",
      hasApplication: !!application,
      bookingRequests: bookingRequests || [],
    };

    res.json({ success: true, user: profileData });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};


// New endpoint to handle booking request actions (accept/reject)
const updateBookingRequestStatus = async (req, res) => {
  const { requestId, status } = req.body;

  try {
    const bookingRequest = await BookingRequest.findById(requestId);
    if (!bookingRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Booking request not found" });
    }

    // Ensure only the caretaker can update their requests
    if (bookingRequest.caretaker.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action" });
    }

    bookingRequest.status = status;
    await bookingRequest.save();

    res.json({
      success: true,
      message: `Booking request ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating booking request:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating booking request" });
  }
};





export { loginCaretaker, registerCaretaker, logoutCaretaker, myProfile, updateBookingRequestStatus};
