import express from "express";
import { loginUser, registerUser, logoutUser } from "../Controllers/auth/userAuth.controller.js";
import { myProfile, updateUser, updateAddress } from "../Controllers/user/userProfile.controller.js";
import { userAllInfo } from "../Controllers/user/user.controller.js";
import { sellPet, buyPetList, petInfo, bookPet } from "../Controllers/pet/pet.controller.js";
import { CaretakerList, getCaretakerProfile } from "../Controllers/user/userCaretaker.controller.js";
import { createBookingRequest, getUserBookings } from "../Controllers/appointment/booking.controller.js";
import isAuth from "../Middlewares/isAuth.js";
import uploadFile from "../Middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/signup", registerUser);
userRouter.get("/myinfo", isAuth, myProfile);
userRouter.get("/logout", isAuth, logoutUser);
userRouter.post("/sell-pet", isAuth, uploadFile, sellPet);
userRouter.get("/buy-pet", isAuth, buyPetList);
userRouter.get("/pet-info", isAuth, petInfo);
userRouter.get("/user-profile", isAuth, userAllInfo);
userRouter.post("/book-pet", isAuth, bookPet);
userRouter.get("/caretakers", isAuth, CaretakerList);
userRouter.get("/caretakers/:id", isAuth, getCaretakerProfile);

userRouter.post("/bookings", isAuth, createBookingRequest);
userRouter.get("/bookings", isAuth, getUserBookings);
userRouter.put("/update", isAuth, updateUser);
userRouter.put("/update-address", isAuth, updateAddress);

export default userRouter;
