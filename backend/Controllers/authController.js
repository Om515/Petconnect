import userModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcrypt";

const createWebToken = (user, role, res) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const cookieName = role === "caretaker" ? "caretaker_token" : "user_token";

  res.cookie(cookieName, token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  });
};

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
    createWebToken(user, role, res);
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password or email" });
    }

    createWebToken(user, user.role, res);
    res.json({ success: true, user, role: user.role, message: "Login successful" });
  } catch (error) {
    console.log("Error in authController login : ", error);
    res.json({ success: false, message: "Error" });
  }
};

export { register, login };
