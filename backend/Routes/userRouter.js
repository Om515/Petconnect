import express from "express";
import { loginUser, registerUser, logoutUser } from "../Controllers/auth/userAuth.controller.js";
import { myProfile, updateUser, updateAddress } from "../Controllers/user/userProfile.controller.js";
import { userAllInfo } from "../Controllers/user/user.controller.js";
import { sellPet, buyPetList, petInfo, bookPet } from "../Controllers/pet/pet.controller.js";
import { CaretakerList, getCaretakerProfile } from "../Controllers/user/userCaretaker.controller.js";
import { createBookingRequest, getUserBookings } from "../Controllers/appointment/booking.controller.js";
import { toggleWishlist, getWishlist } from "../Controllers/user/wishlist.controller.js";
import {
  createPetRequest,
  getBuyerPetRequests,
  getOwnerPetRequests,
  acceptPetRequest,
  rejectPetRequest,
  completePetRequest,
} from "../Controllers/pet/petRequest.controller.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../Controllers/pet/razorpay.controller.js";
import { handleRazorpayWebhook } from "../Controllers/pet/razorpayWebhook.controller.js";
import {
  submitReview,
  getOwnerReviews,
  getBuyerReviews,
  checkReviewEligibility,
} from "../Controllers/user/review.controller.js";
import isAuth from "../Middlewares/isAuth.js";
import uploadFile, { uploadPetFields } from "../Middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/signup", registerUser);
userRouter.get("/myinfo", isAuth, myProfile);
userRouter.get("/logout", isAuth, logoutUser);
userRouter.post("/sell-pet", isAuth, uploadPetFields, sellPet);
userRouter.get("/buy-pet", isAuth, buyPetList);
userRouter.get("/pet-info", isAuth, petInfo);
userRouter.get("/user-profile", isAuth, userAllInfo);
userRouter.post("/book-pet", isAuth, bookPet);

// Pet Request Endpoints
userRouter.post("/pet-request", isAuth, createPetRequest);
userRouter.get("/pet-requests", isAuth, getBuyerPetRequests);
userRouter.get("/owner-pet-requests", isAuth, getOwnerPetRequests);
userRouter.patch("/pet-request/:requestId/accept", isAuth, acceptPetRequest);
userRouter.patch("/pet-request/:requestId/reject", isAuth, rejectPetRequest);
userRouter.patch("/pet-request/:requestId/complete", isAuth, completePetRequest);

// Razorpay Payment Endpoints
userRouter.post("/razorpay/create-order", isAuth, createRazorpayOrder);
userRouter.post("/razorpay/verify-payment", isAuth, verifyRazorpayPayment);
userRouter.post("/razorpay/webhook", handleRazorpayWebhook);

// Pet Review Endpoints
userRouter.post("/review", isAuth, submitReview);
userRouter.get("/reviews/owner/:ownerId", isAuth, getOwnerReviews);
userRouter.get("/reviews/buyer/:buyerId", isAuth, getBuyerReviews);
userRouter.get("/pet-request/:petRequestId/review-status", isAuth, checkReviewEligibility);

userRouter.get("/caretakers", isAuth, CaretakerList);
userRouter.get("/caretakers/:id", isAuth, getCaretakerProfile);

userRouter.post("/bookings", isAuth, createBookingRequest);
userRouter.get("/bookings", isAuth, getUserBookings);
userRouter.put("/update", isAuth, updateUser);
userRouter.put("/update-address", isAuth, updateAddress);

userRouter.post("/wishlist/toggle", isAuth, toggleWishlist);
userRouter.get("/wishlist", isAuth, getWishlist);

export default userRouter;


