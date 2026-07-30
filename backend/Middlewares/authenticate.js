import jwt from "jsonwebtoken";
import userModel from "../Models/userModel.js";

const authenticate = (allowedRoles) => async (req, res, next) => {
  try {
    let token;
    
    if (allowedRoles.includes("caretaker") && allowedRoles.includes("user")) {
       token = req.cookies.caretaker_token || req.cookies.user_token;
    } else {
       token = allowedRoles.includes("caretaker") ? req.cookies.caretaker_token : req.cookies.user_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Please Login" });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ success: false, message: "Token expired or invalid" });
    }

    if (!decodedData || !decodedData.id) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    let user;
    try {
      user = await userModel.findById(decodedData.id).select("-password");
    } catch (dbError) {
      console.error("Database query failed in authenticate middleware:", dbError);
      return res.status(500).json({ success: false, message: "Database connection error. Please try again." });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticate middleware:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default authenticate;

