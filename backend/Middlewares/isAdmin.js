import express from "express";
import jwt from "jsonwebtoken";
import adminModel from "../Models/adminModel.js";

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Please Login" });
    }

    let decodedData;
    try {
      decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }

    if (!decodedData || !decodedData.id) {
      return res.status(401).json({ success: false, message: "Token Expired" });
    }

    let admin;
    try {
      admin = await adminModel.findById(decodedData.id).select("-password");
    } catch (dbError) {
      console.error("Database query failed in isAdmin middleware:", dbError);
      return res.status(500).json({ success: false, message: "Database connection error. Please try again." });
    }

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Error in isAdmin middleware:", error);
    res.status(500).json({ success: false, message: "Admin Authentication Error" });
  }
};

export default isAdmin;