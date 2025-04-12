import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export default async function protectedRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "You are not authenticated" });
    }
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (e) {
    console.error("Error in Middleware " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}
