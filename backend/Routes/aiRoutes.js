import express from "express";
import { aiGuestLimiter } from "../Middlewares/aiRateLimiter.js";
import isAuth from "../Middlewares/isAuth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage(); // Store in memory as buffer for Gemini
const upload = multer({ storage: storage });

// Import the newly created aiController
import * as aiController from "../Controllers/aiController.js";

// Route intended for guest users (rate limited)
router.post("/scan-guest", aiGuestLimiter, upload.single("image"), aiController.scanPet);

// Route intended for authenticated users (unlimited)
router.post("/scan-auth", isAuth, upload.single("image"), aiController.scanPet);

export default router;
