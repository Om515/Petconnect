import adminModel from "../../Models/adminModel.js";

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

export { myInfoAdmin };
