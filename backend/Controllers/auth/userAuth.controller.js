import { register, login } from "./auth.controller.js";

const loginUser = async (req, res) => {
  return login(req, res);
};

const registerUser = async (req, res) => {
  req.body.role = "user";
  return register(req, res);
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("user_token", "", { maxAge: 0 });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout :", error);
    res.json({ message: false, message: "Error" });
  }
};

export { loginUser, registerUser, logoutUser };
