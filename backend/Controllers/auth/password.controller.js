import userModel from "../../Models/userModel.js";
import adminModel from "../../Models/adminModel.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/emailHelper.js";

// Helper function to resolve the correct MongoDB Model based on the role
const getModelByRole = (role) => {
  if (role === "admin") return adminModel;
  if (role === "user" || role === "caretaker") return userModel;
  return null;
};

// Generates a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Endpoint 1: Request OTP
export const forgotPassword = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.json({ success: false, message: "Email and role are required." });

  const Model = getModelByRole(role);
  if (!Model) return res.json({ success: false, message: "Invalid role provided." });

  try {
    const user = await Model.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    const otp = generateOTP();
    
    // Print the OTP in the backend terminal for easy testing
    console.log(`\n============================`);
    console.log(`🔐 Generated OTP for ${email}: ${otp}`);
    console.log(`============================\n`);

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    
    // Validate email constraints before saving if necessary, though update usually bypasses strict save
    await user.save({ validateModifiedOnly: true });

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the following OTP to proceed:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px; color: #333;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Thank you,<br/>PetConnect Team</p>
      </div>`;

    const mailSent = await sendEmail({ to: email, subject: "PetConnect - Password Reset OTP", html });
    
    if (!mailSent) {
      user.resetPasswordOTP = null;
      user.resetPasswordExpires = null;
      await user.save({ validateModifiedOnly: true });
      return res.json({ success: false, message: "Failed to send OTP email. Please try again." });
    }

    res.json({ success: true, message: "OTP sent to your email successfully." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.json({ success: false, message: "Internal server error." });
  }
};

// Endpoint 2: Verify OTP 
export const verifyOTP = async (req, res) => {
  const { email, role, otp } = req.body;
  
  if (!email || !role || !otp) return res.json({ success: false, message: "Email, role, and OTP are required." });

  const Model = getModelByRole(role);
  if (!Model) return res.json({ success: false, message: "Invalid role provided." });

  try {
    const user = await Model.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    if (user.resetPasswordOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.json({ success: false, message: "Internal server error." });
  }
};

// Endpoint 3: Reset Password
export const resetPassword = async (req, res) => {
  const { email, role, otp, newPassword } = req.body;
  if (!email || !role || !otp || !newPassword) return res.json({ success: false, message: "Missing required fields." });

  const Model = getModelByRole(role);
  if (!Model) return res.json({ success: false, message: "Invalid role provided." });

  try {
    const user = await Model.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found." });

    if (user.resetPasswordOTP !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.resetPasswordExpires) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save({ validateModifiedOnly: true });

    res.json({ success: true, message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.json({ success: false, message: "Internal server error." });
  }
};
