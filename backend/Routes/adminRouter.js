import express from 'express';
import { approvePet, displayUsers, loginAdmin, logoutAdmin, myInfoAdmin, petList, rejectPet, signupAdmin, soldPetslist } from '../Controllers/adminController.js';
import isAdmin from '../Middlewares/isAdmin.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/signup", signupAdmin);
adminRouter.get("/logout", isAdmin, logoutAdmin);
adminRouter.get("/myinfo", isAdmin, myInfoAdmin);
adminRouter.get("/get-pet-list",isAdmin,petList)
adminRouter.post("/approve-pet",isAdmin,approvePet)
adminRouter.post("/reject-pet",isAdmin,rejectPet)
adminRouter.get("/display-users",isAdmin,displayUsers);
adminRouter.get("/sold-pets",isAdmin,soldPetslist);

export default adminRouter;