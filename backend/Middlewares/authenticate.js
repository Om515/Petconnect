import jwt from "jsonwebtoken";
import userModel from "../Models/userModel.js";

const authenticate = (allowedRoles) => async (req, res, next) => {
  try {
    const token = allowedRoles.includes("caretaker")
      ? req.cookies.caretaker_token
      : req.cookies.user_token;

    if (!token) {
      return res.json({ success: false, message: "Please Login" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedData) {
      return res.json({ success: false, message: "Token expired" });
    }

    req.user = await userModel.findById(decodedData.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.log("Error in authenticate middleware:", error);
    return res.json({ success: false, message: "Authentication Error" });
  }
};

export default authenticate;
