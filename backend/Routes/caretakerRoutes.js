import express from "express";
import { loginCaretaker, registerCaretaker, logoutCaretaker } from "../Controllers/auth/caretakerAuth.controller.js";
import { myProfile } from "../Controllers/caretaker/caretakerProfile.controller.js";
import { applyAsCaretaker, getMyApplication } from "../Controllers/caretaker/caretakerApplication.controller.js";
import { updateBookingRequestStatus } from "../Controllers/caretaker/caretakerBooking.controller.js";
import isAuth from "../Middlewares/isAuth.js";
import caretakerIsAuth from "../Middlewares/caretakerIsAuth.js";

const CaretakerRouter = express.Router();

// Existing routes
CaretakerRouter.post("/signup", registerCaretaker);
CaretakerRouter.post("/login", loginCaretaker);
CaretakerRouter.get("/logout", logoutCaretaker);
CaretakerRouter.get("/myinfo", caretakerIsAuth, myProfile);

// New caretaker application routes
CaretakerRouter.post("/apply", caretakerIsAuth, (req, res, next) => {
  console.log("Reached /api/caretaker/apply");
  next();
}, applyAsCaretaker);
CaretakerRouter.get("/my-applications", caretakerIsAuth, getMyApplication);

CaretakerRouter.post(
  "/booking-request/status",
  caretakerIsAuth,
  updateBookingRequestStatus
);

export default CaretakerRouter;