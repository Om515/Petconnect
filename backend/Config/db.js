import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";

dotenv.config();

// Force IPv4 first DNS lookup to prevent ENOTFOUND / ECONNRESET on Windows
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const mongo_url = process.env.MONGO_CONN;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongo_url, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      family: 4,
    });
    console.log("Mongo Connected");
  } catch (err) {
    console.error("Error in connectDB:", err);
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected.");
});

