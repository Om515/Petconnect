import express from "express";
import { bookPet, buyPetList, loginUser, logoutUser, myProfile, petInfo, registerUser, sellPet, userAllInfo,CaretakerList,getCaretakerProfile,createBookingRequest,getUserBookings, updateUser, updateAddress} from "../Controllers/userController.js";
import isAuth from "../Middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";



const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/signup", registerUser);
userRouter.get("/myinfo", isAuth, myProfile);
userRouter.get("/logout", isAuth, logoutUser);
userRouter.post("/sell-pet",isAuth,uploadFile,sellPet);
userRouter.get("/buy-pet", isAuth, buyPetList);
userRouter.get("/pet-info", isAuth, petInfo);
userRouter.get("/user-profile", isAuth, userAllInfo);
userRouter.post("/book-pet", isAuth, bookPet);
userRouter.get("/caretakers",isAuth,CaretakerList);
userRouter.get("/caretakers/:id", isAuth, getCaretakerProfile);

userRouter.post("/bookings", isAuth, createBookingRequest);
userRouter.get("/bookings", isAuth, getUserBookings);
userRouter.put("/update",isAuth,updateUser)
userRouter.put("/update-address",isAuth,updateAddress)

export default userRouter;
