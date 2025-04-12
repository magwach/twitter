import express from "express";
import {
  getAllNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import protectedRoute from "../middleware/protect.js";

const notificationRoute = express.Router();
notificationRoute.get("/", protectedRoute, getAllNotifications);
notificationRoute.delete("/delete/:userId", protectedRoute, deleteNotification);
notificationRoute.post("/read/:id", protectedRoute, markAsRead);

export default notificationRoute;
