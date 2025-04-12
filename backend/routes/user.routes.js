import express from "express";
import protectedRoute from "../middleware/protect.js";
import {
  followUnfollowUser,
  getUserProfile,
  getSuggestedUser,
  updateUserProfile,
} from "../controllers/user.controller.js";

const userRoute = express.Router();

userRoute.get("/profile/:username", protectedRoute, getUserProfile);
userRoute.get("/suggested", protectedRoute, getSuggestedUser);
userRoute.post("/follow/:id", protectedRoute, followUnfollowUser);
userRoute.post("/update", protectedRoute, updateUserProfile);

export default userRoute;
