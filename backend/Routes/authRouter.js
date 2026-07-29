import express from "express";
import { register } from "../Controllers/auth/auth.controller.js";
import { forgotPassword, verifyOTP, resetPassword } from "../Controllers/index.js";

const authRouter = express.Router();

authRouter.post("/signup", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
