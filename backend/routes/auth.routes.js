import express from "express";
import {
  login,
  signup,
  logout,
  getUser,
} from "../controllers/auth.controller.js";
import protectedRoute from "../middleware/protect.js";

const authRoute = express.Router();

authRoute.get("/user", protectedRoute, getUser);

authRoute.post("/signup", signup);

authRoute.post("/login", login);

authRoute.post("/logout", logout);

export default authRoute;
