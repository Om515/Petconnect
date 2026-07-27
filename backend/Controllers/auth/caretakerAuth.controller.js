import { register, login } from "./auth.controller.js";

const loginCaretaker = async (req, res) => {
  return login(req, res);
};

const registerCaretaker = async (req, res) => {
  req.body.role = "caretaker";
  return register(req, res);
};

const logoutCaretaker = async (req, res) => {
  try {
    res.cookie("caretaker_token", "", { maxAge: 0 });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout :", error);
    res.json({ message: false, message: "Error" });
  }
};

export { loginCaretaker, registerCaretaker, logoutCaretaker };
