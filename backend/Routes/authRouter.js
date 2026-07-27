import express from "express";
import { register } from "../Controllers/auth/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", register);

export default authRouter;
