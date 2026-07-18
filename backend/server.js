import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./Config/db.js";
import userRouter from "./Routes/userRouter.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import adminRouter from "./Routes/adminRouter.js";
import CaretakerRouter from "./Routes/caretakerRoutes.js";
import cloudinary from "cloudinary"

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
app.use(express.json())
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())

// db connection
connectDB();

// api endpoints
app.use("/api/user",userRouter)
app.use("/api/admin",adminRouter)
app.use("/api/caretaker",CaretakerRouter)


app.get("/",(req,res)=>{
    res.send("Api Working");
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});