import express from "express";
import authenticate from "../Middlewares/authenticate.js";
import { register } from "../Controllers/auth/auth.controller.js";
import { forgotPassword, verifyOTP, resetPassword, googleLogin, setPassword } from "../Controllers/index.js";

const authRouter = express.Router();

authRouter.post("/signup", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/google-login", googleLogin);

// Protected route: user must be logged in to set their missing password
authRouter.put("/set-password", authenticate(["user", "caretaker"]), setPassword);

export default authRouter;
