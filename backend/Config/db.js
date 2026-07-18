import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const mongo_url = process.env.MONGO_CONN;

export const connectDB = async () => {
    try {
        await mongoose.connect(mongo_url, {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Mongo Conected");
    } catch (err) {
        console.log("Error in connectDB, ",err);
    }
}
