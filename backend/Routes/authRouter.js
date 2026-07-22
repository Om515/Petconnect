import express from "express";
import { register } from "../Controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", register);

export default authRouter;
