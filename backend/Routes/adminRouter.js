import express from 'express';
import { loginAdmin, signupAdmin, logoutAdmin } from '../Controllers/auth/adminAuth.controller.js';
import { myInfoAdmin } from '../Controllers/admin/admin.controller.js';
import { petList, approvePet, rejectPet, soldPetslist } from '../Controllers/admin/adminPet.controller.js';
import { displayUsers } from '../Controllers/admin/adminUser.controller.js';
import { caretakerApplicationList, approveCaretaker, rejectCaretaker } from '../Controllers/admin/adminCaretaker.controller.js';
import { getPendingProfiles, approveProfile, rejectProfile } from '../Controllers/admin/adminProfileApproval.controller.js';
import isAdmin from '../Middlewares/isAdmin.js';

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/signup", signupAdmin);
adminRouter.get("/logout", isAdmin, logoutAdmin);
adminRouter.get("/myinfo", isAdmin, myInfoAdmin);
adminRouter.get("/get-pet-list", isAdmin, petList);
adminRouter.post("/approve-pet", isAdmin, approvePet);
adminRouter.post("/reject-pet", isAdmin, rejectPet);
adminRouter.get("/display-users", isAdmin, displayUsers);
adminRouter.get("/sold-pets", isAdmin, soldPetslist);
adminRouter.get("/get-caretaker-list", isAdmin, caretakerApplicationList);
adminRouter.post("/approve-caretaker", isAdmin, approveCaretaker);
adminRouter.post("/reject-caretaker", isAdmin, rejectCaretaker);

// Professional Profile Approval Routes
adminRouter.get("/caretaker-profiles/pending", isAdmin, getPendingProfiles);
adminRouter.post("/caretaker-profiles/approve", isAdmin, approveProfile);
adminRouter.post("/caretaker-profiles/reject", isAdmin, rejectProfile);

export default adminRouter;