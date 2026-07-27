import adminModel from "../../Models/adminModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { createWebToken } from "../../utils/tokenHelper.js";

const signupAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await adminModel.findOne({ email });

        if (exists) {
            return res.json({ success: false, message: "Admin alrady exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, messgae: "Email is not valid" });
        }
        
        if (password.length < 6) {
            return res.json({ success: false, messgae: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new adminModel({
            name: name,
            email: email,
            password: hashedPassword,
        });

        const admin = await newAdmin.save();
        createWebToken(admin, "admin_token", res, "1h", 60 * 60 * 1000);
        res.json({ success: true, admin, message: "Signup successfully" });

    } catch (error) {
        console.log("adminController signupAdmin error: ", error);
        res.json({ success: false, message: "Error" });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await adminModel.findOne({ email });

        if (!admin) {
            return res.json({ success: false, message: "Admin doesn't exists" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Wrong Password or Email" });
        }

        createWebToken(admin, "admin_token", res, "1h", 60 * 60 * 1000);
        res.json({ success: true, admin, message: "Logged In" });

    } catch (error) {
         console.log("Error adminController login : ", error);
        res.json({ success: false, message: "Error" });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.cookie("admin_token", "", { maxAge: 0 });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in admin Logout :", error);
        res.json({ message: false, message: "Error" });      
    }
};

export { signupAdmin, loginAdmin, logoutAdmin };
