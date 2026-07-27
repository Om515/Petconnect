import userModel from "../../Models/userModel.js";

const myProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: "Error" });
    console.log("Error in myProfile", error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { email, name, mobile } = req.body;
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "No user with this email" });
    }
    
    user.name = name;
    user.mobile = mobile;
    
    await user.save();
    res.json({ success: true, message: "ser updated successfully" });

  } catch (error) {
    console.log("Error in update user ", error);
    res.status(400).json({
      message: "Error"
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { address } = req.body;

    const userId = req.user._id;

    if (!userId) {
      return res.json({ success: false, message: "User Id not found" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.address = address;

    await user.save();

    res.json({ success: true, message: "Address updated successfully" });
  } catch (error) {
    console.log("Error in updateAddress :", error);
    res.json({ success: false, message: "Internal server Error" });
  }
};

export { myProfile, updateUser, updateAddress };
