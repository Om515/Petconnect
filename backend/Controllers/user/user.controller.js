import userModel from "../../Models/userModel.js";
import { petOrder } from "../../Models/petModel.js";

const userAllInfo = async (req, res) => {
  try {
    const id = req.user._id;
  
    if (!id) {
      return res.json({ success: false, message: "Id not found" });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.json({ success: false, message: "User not Found" });
    }
    
    const myPetDetails = await petOrder.find({ owner: id });
    
    if (!myPetDetails) {
      return res.json({ success: false, message: "Pets not Found" });
    }
    
    const buyPetDetails = await petOrder.find({ soldBool: true, buyer: id });
    
    if (!buyPetDetails) {
      return res.json({ success: false, message: "Pets not Found" });
    }
  
    res.json({ success: true, user, myPetDetails, buyPetDetails, message: "Data feted successfully" });
  } catch (error) {
    console.log("Error in userPetInfo : ", error);
    res.json({ success: false, message: "Error" });
  }
};

export { userAllInfo };
