import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import postRoute from "./routes/post.routes.js";
import mongoConnect from "./db/dbConnection.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import notificationRoute from "./routes/notification.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/post", postRoute);
app.use("/api/notifications", notificationRoute);

const port = process.env.PORT || "5000";

app.listen(port, () => {
  mongoConnect();
  console.log(`Server is running on port ${port}`);
});
