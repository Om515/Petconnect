import express from "express";
import jwt from "jsonwebtoken";
import adminModel from "../Models/adminModel.js";

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.admin_token;

        if (!token) {
            return res.status(401).json({ success: false, message: "Please Login" });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedData) {
            return res.status(401).json({ success: false, message: "Token Expired" });
        }

        // Fetching admin from DB
        const admin = await adminModel.findById(decodedData.id).select("-password");

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.log("Error in isAdmin middleware:", error);
        res.status(500).json({ success: false, message: "Admin Authentication Error" });
    }
};

export default isAdmin;