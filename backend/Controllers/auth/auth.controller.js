import userModel from "../../Models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { createWebToken } from "../../utils/tokenHelper.js";
import { sendEmail } from "../../utils/emailHelper.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  let { name, mobile, address, email, password, role } = req.body;

  role = role || "user";
  
  if (role !== "user" && role !== "caretaker") {
     return res.json({ success: false, message: "Invalid role" });
  }

  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter valid email" });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Please Enter strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      mobile: mobile,
      address: address,
      password: hashedPassword,
      role: role,
    });

    const user = await newUser.save();
    const cookieName = role === "caretaker" ? "caretaker_token" : "user_token";
    createWebToken(user, cookieName, res, "1d", 1 * 24 * 60 * 60 * 1000);

    // Send Welcome Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; color: #333;">
        <h1 style="color: #0d9488;">Welcome to PetConnect, ${name}! 🐾</h1>
        <p style="font-size: 16px;">We are so excited to have you join our amazing community.</p>
        <p style="font-size: 16px;">You signed up as a <strong>${role}</strong>.</p>
        <br/>
        <p style="font-size: 14px; color: #666;">If you have any questions, feel free to reach out to us at any time!</p>
        <p style="font-size: 14px; font-weight: bold; color: #0d9488;">— The PetConnect Team</p>
      </div>
    `;
    
    // We don't await this so it doesn't block the frontend response, making signups feel instantly fast
    sendEmail({ 
      to: email, 
      subject: "Welcome to PetConnect! 🎉", 
      html: emailHtml 
    }).catch(err => console.error("Failed to send welcome email:", err));

    res.json({ success: true, user, message: "Registered Successfully" });
  } catch (error) {
    console.log("authController register error: ", error);
    res.json({ success: false, message: "Error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    if (!user.password) {
      return res.json({ success: false, message: "This account uses Google Sign-In. Log in with Google, or set a password from your profile." });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password or email" });
    }

    const cookieName = user.role === "caretaker" ? "caretaker_token" : "user_token";
    createWebToken(user, cookieName, res, "1d", 1 * 24 * 60 * 60 * 1000);
    res.json({ success: true, user, role: user.role, message: "Login successful" });
  } catch (error) {
    console.log("Error in authController login : ", error);
    res.json({ success: false, message: "Error" });
  }
};

const googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    let user = await userModel.findOne({ email });
    
    if (user) {
      // If they exist but don't have a googleId linked yet
      if (user.authProvider !== 'google' || !user.googleId) {
        user.authProvider = 'google';
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Auto-create new user with role 'user'
      user = new userModel({
        name,
        email,
        googleId,
        authProvider: "google",
        role: "user",
      });
      await user.save();
      
      const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; color: #333;">
        <h1 style="color: #0d9488;">Welcome to PetConnect, ${name}! 🐾</h1>
        <p style="font-size: 16px;">We are so excited to have you join our amazing community.</p>
        <p style="font-size: 16px;">You successfully signed up securely using Google.</p>
      </div>`;
      
      sendEmail({ to: email, subject: "Welcome to PetConnect! 🎉", html: emailHtml })
        .catch(err => console.error("Failed to send welcome email:", err));
    }
    
    const cookieName = user.role === "caretaker" ? "caretaker_token" : "user_token";
    createWebToken(user, cookieName, res, "1d", 1 * 24 * 60 * 60 * 1000);
    res.json({ success: true, user, role: user.role, message: "Successfully logged in with Google!" });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.json({ success: false, message: "Google Authentication Failed" });
  }
};

export { register, login, googleLogin };
