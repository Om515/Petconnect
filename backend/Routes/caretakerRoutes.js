import express from "express";
import { loginCaretaker, registerCaretaker, logoutCaretaker, myProfile,updateBookingRequestStatus } from "../Controllers/caretakerController.js";
import { applyAsCaretaker, getMyApplication } from "../Controllers/caretakerApplicationController.js";
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


// Routes/caretakerRouter.js
CaretakerRouter.post(
  "/booking-request/status",
  caretakerIsAuth,
  updateBookingRequestStatus
);

CaretakerRouter.get("/myinfo",caretakerIsAuth , myProfile);

export default CaretakerRouter;




// CaretakerRouter.get("/myinfo",caretakerIsAuth , myProfile);