import adminModel from "../Models/adminModel.js";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
    try {
        const adminName = process.env.ADMIN_NAME;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminName || !adminEmail || !adminPassword) {
            console.warn("⚠️  Skipping admin seeder: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing from .env");
            return;
        }

        const adminExists = await adminModel.findOne({ email: adminEmail });

        if (adminExists) {
            console.log("Default admin already exists.");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const newAdmin = new adminModel({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
        });

        await newAdmin.save();
        console.log("Default admin created successfully.");

    } catch (error) {
        console.error("Error seeding default admin:", error);
    }
};

export default seedAdmin;
