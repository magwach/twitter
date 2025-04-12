import express from "express";
import protectedRoute from "../middleware/protect.js";
import {
  createPost,
  deletePost,
  commentPost,
  likeUnlikePost,
  getAllPosts,
  getlikedPosts,
  getAllFollowingPosts,
  getMyPosts,
} from "../controllers/post.controller.js";

const postRoute = express.Router();

postRoute.get("/all", protectedRoute, getAllPosts);
postRoute.get("/following", protectedRoute, getAllFollowingPosts);
postRoute.get("/:username", protectedRoute, getMyPosts);
postRoute.get("/liked", protectedRoute, getlikedPosts);
postRoute.post("/create", protectedRoute, createPost);
postRoute.post("/like/:id", protectedRoute, likeUnlikePost);
postRoute.post("/comment/:id", protectedRoute, commentPost);
postRoute.delete("/delete/:id", protectedRoute, deletePost);

export default postRoute;
