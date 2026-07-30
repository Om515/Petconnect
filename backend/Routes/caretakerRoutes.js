import express from "express";
import { loginCaretaker, registerCaretaker, logoutCaretaker } from "../Controllers/auth/caretakerAuth.controller.js";
import { myProfile } from "../Controllers/caretaker/caretakerProfile.controller.js";
import { applyAsCaretaker, getMyApplication } from "../Controllers/caretaker/caretakerApplication.controller.js";
import { updateBookingRequestStatus } from "../Controllers/caretaker/caretakerBooking.controller.js";
import isAuth from "../Middlewares/isAuth.js";
import caretakerIsAuth from "../Middlewares/caretakerIsAuth.js";
import authenticate from "../Middlewares/authenticate.js";

import { getMyProfessionalProfile, updateProfessionalProfile } from "../Controllers/caretaker/professionalProfile.controller.js";
import { getMyCaretakerStats } from "../Controllers/caretaker/caretakerStats.controller.js";

const CaretakerRouter = express.Router();

// Existing routes
CaretakerRouter.post("/signup", registerCaretaker);
CaretakerRouter.post("/login", loginCaretaker);
CaretakerRouter.get("/logout", logoutCaretaker);
CaretakerRouter.get("/myinfo", caretakerIsAuth, myProfile);
CaretakerRouter.get("/stats", caretakerIsAuth, getMyCaretakerStats);

// Professional Profile routes
CaretakerRouter.get("/professional-profile", caretakerIsAuth, getMyProfessionalProfile);
CaretakerRouter.post("/professional-profile", caretakerIsAuth, updateProfessionalProfile);

// New caretaker application routes
CaretakerRouter.post("/apply", authenticate(["user", "caretaker"]), (req, res, next) => {
  console.log("Reached /api/caretaker/apply");
  next();
}, applyAsCaretaker);
CaretakerRouter.get("/my-applications", authenticate(["user", "caretaker"]), getMyApplication);

CaretakerRouter.post(
  "/booking-request/status",
  caretakerIsAuth,
  updateBookingRequestStatus
);

export default CaretakerRouter;