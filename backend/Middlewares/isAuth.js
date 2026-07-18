import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../Models/userModel.js";

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.user_token;

        if (!token) {
            return res.json({ success: false, message: "Please Login" });
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedData) {
            return res.json({ success: false, message: "Token expired" });
        }

        // Fetching user from DB and storing it in req.user
        req.user = await userModel.findById(decodedData.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        next();

    } catch (error) {
        console.log("Error in isAuth:", error);
        res.json({ success: false, message: "Authentication Error" });
    }
}

export default isAuth;
