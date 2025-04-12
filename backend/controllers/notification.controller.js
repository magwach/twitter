import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export async function getAllNotifications(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const notifications = await Notification.find({
      to: userId,
    }).populate({
      path: "from",
      select: { userName: 1, profileImg: 1 },
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json({ data: notifications });
  } catch (error) {
    console.log("Error in getNotifications" + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({
      to: userId,
    }).select("to");
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (notifications.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Notifications cannot be found" });
    }
    await Notification.deleteMany({ to: userId });
    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.log("Error in deleteNotification" + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function markAsRead(req, res) {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById(notificationId);
    const notifications = await Notification.find({
      to: userId,
    }).select("to");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!notification) {
      return res.status(400).json({ error: "Notification cannot be found" });
    }
    if (notifications.length === 0) {
      return res
        .status(400)
        .json({ error: "You are not authorized to read this notification" });
    }
    await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.log("Error in deleteNotification" + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}
