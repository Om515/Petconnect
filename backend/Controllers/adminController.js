import adminModel from "../Models/adminModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { petOrder } from "../Models/petModel.js";
import userModel from "../Models/userModel.js";

const createWebToken = (user,res) => {
    const token = jwt.sign({id:user._id, email:user.email},process.env.JWT_SECRET,{
        expiresIn : "1h",
    });

    res.cookie("admin_token",token,{
        maxAge : 60*60*1000,
        httpOnly:true,
        sameSite:"strict",
    })
}

const signupAdmin = async(req,res) => {
    const {name,email,password} = req.body;
    try {
        const exists = await adminModel.findOne({email});

        if(exists){
            return res.json({success:false,message:"Admin alrady exists"});
        }

        if(!validator.isEmail(email)){
            return res.json({success:false,messgae:"Email is not valid"});
        }
        
        if(password.length < 6){
            return res.json({success:false,messgae:"Please enter a strong password"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newAdmin = new adminModel({
            name:name,
            email:email,
            password:hashedPassword,
        })

        const admin = await newAdmin.save();
        createWebToken(admin,res);
        res.json({success:true,admin,message:"Signup successfully"});

    } catch (error) {
        console.log("adminController signupAdmin error: ",error);
        res.json({success:false,message:"Error"})
    }
}

const loginAdmin = async(req,res) =>{
    const {email,password} = req.body;
    try {
        const admin = await adminModel.findOne({email});

        if(!admin){
            return res.json({success:false,message:"Admin doesn't exists"})
        }

        const isMatch = await bcrypt.compare(password,admin.password);
        if(!isMatch){
            return res.json({success:false,message:"Wrong Password or Email"});
        }

        createWebToken(admin,res);
        res.json({success:true,admin,message:"Logged In"});

    } catch (error) {
         console.log("Error adminController login : ",error);
        res.json({success:false,message:"Error"});
    }
}

const logoutAdmin = async(req,res) => {
    try {
        res.cookie("admin_token","",{maxAge:0});
        res.json({success:true,message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in admin Logout :",error);
        res.json({message:false,message:"Error"});      
    }
    
}

const myInfoAdmin = async (req, res) => {
    try {
        if (!req.admin) {
            console.log("req.admin is undefined or null");
            return res.status(401).json({ success: false, message: "Unauthorized: Admin not found" });
        }

        const adminId = req.admin._id;

        const admin = await adminModel.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found in database" });
        }

        res.json({ success: true, admin });
    } catch (error) {
        console.log("Error in myInfoAdmin:", error);
        res.status(500).json({ success: false, message: "Cannot get admin" });
    }
};


const petList = async(req,res) => {
    try {
        const petContent = await petOrder.find({ isVerified:false });
        console.log(petContent);
        res.json({success:true,message:"Data fetched successfully",petContent})
    } catch (error) {
        console.log("Error in petList ",error);
        res.json({success:false,message:"Error"})
    }
}

const approvePet = async(req,res) => {
    try {
        const id = req.body.id;

        const pet = await petOrder.findById(id);

        if(!pet){
            return res.json({success:false,message:"Pet not identified"})
        }

        pet.isVerified = true;
        pet.isApproved = true;

        await pet.save();

        res.json({success: true, message: "Request Approved"});

    } catch (error) {
        console.log("Error in approvePet: ", error);
        res.json({success: false, message: "Error"});
    }
}

const rejectPet = async(req,res) => {
    try {
        const id = req.body.id;

        const pet = await petOrder.findById(id);

        if(!pet){
            return res.json({success:false,message:"Pet not identified"})
        }

        pet.isVerified = true;
        pet.isApproved = false;

        await pet.save();

        res.json({success: true, message: "Request Rejected"});

    } catch (error) {
        console.log("Error in approvePet: ", error);
        res.json({success: false, message: "Error"});
    }
}

const displayUsers = async(req,res) => {
    try {
        const allUsers = await userModel.find();

        if(!allUsers){
            return res.json({success:false, message:"No users Found"});
        }

        res.json({success:true, message:"All users found", allUsers})

    } catch (error) {
        console.log("Error in displayUsers: ", error);
        res.json({success:false, message:"Internal server Error"});
    }
}

const soldPetslist = async(req,res) => {
    try {
        const petsSold = await petOrder.find({ soldBool:true });
    
        if(!petsSold){
            return res.json({success:false, message:"No pets are sold"})
        }
    
        res.json({ success:true, message:"Fetched data successfully", petsSold});
        
    } catch (error) {
        console.log("Error in soldPets: ", error);
        res.json({success:false, message:"Internal server Error"});
    }

}

export {loginAdmin,logoutAdmin,signupAdmin,myInfoAdmin,petList,approvePet,rejectPet,displayUsers,soldPetslist};
