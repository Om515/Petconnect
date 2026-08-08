import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";
import userRouter from "./Routes/userRouter.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import adminRouter from "./Routes/adminRouter.js";
import CaretakerRouter from "./Routes/caretakerRoutes.js";
import authRouter from "./Routes/authRouter.js";
import chatRouter from "./Routes/chatRouter.js";
import aiRouter from "./Routes/aiRoutes.js";
import cloudinary from "cloudinary";
import seedAdmin from "./Seed/adminSeeder.js";
import { initSocket } from "./socket.js";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// app config
const app = express();
const port = process.env.PORT || 7001;

// middlewares
app.use(
  express.json({
    limit: "50mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());

// db connection
connectDB().then(() => {
  seedAdmin();
});

// api endpoints
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/caretaker", CaretakerRouter);
app.use("/api/chat", chatRouter);
app.use("/api/ai", aiRouter);

app.get("/", (req, res) => {
  res.send("Api Working");
});

// Start Express & Socket.io Server
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
  initSocket(server);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is in use. Shutting down process...`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});

// Clean shutdown handler for Nodemon restarts and manual interrupts
const handleShutdown = () => {
  if (server && server.listening) {
    server.close(() => {
      console.log("Server shut down gracefully, port released.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.once("SIGINT", handleShutdown);
process.once("SIGTERM", handleShutdown);
process.once("SIGUSR2", handleShutdown); // Nodemon default restart signal