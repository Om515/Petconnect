import userModel from "../../Models/userModel.js";

const displayUsers = async (req, res) => {
    try {
        const allUsers = await userModel.find();

        if (!allUsers) {
            return res.json({ success: false, message: "No users Found" });
        }

        res.json({ success: true, message: "All users found", allUsers });

    } catch (error) {
        console.log("Error in displayUsers: ", error);
        res.json({ success: false, message: "Internal server Error" });
    }
};

export { displayUsers };
