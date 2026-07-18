import jwt from "jsonwebtoken";
import caretakerModel from "../Models/caretakerModel.js";

const caretakerIsAuth = async (req, res, next) => {
  try {
    const token = req.cookies.caretaker_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Please Login" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedData) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    // Fetch from caretakerModel using _id (matches createWebToken)
    req.user = await caretakerModel.findById(decodedData.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Caretaker not found" });
    }

    next();
  } catch (error) {
    console.log("Error in caretakerIsAuth:", error);
    return res.status(401).json({ success: false, message: "Authentication Error" });
  }
};

export default caretakerIsAuth;