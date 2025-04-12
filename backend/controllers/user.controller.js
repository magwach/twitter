import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export async function getUserProfile(req, res) {
  const { username } = req.params;

  try {
    const user = await User.findOne({ userName: username }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (e) {
    console.error("Error in getUserProfile " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function followUnfollowUser(req, res) {
  try {
    const { id } = req.params;
    const usertoFollowUnfollow = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow/unfollow yourself.",
      });
    }

    if (!usertoFollowUnfollow || !currentUser) {
      res.status(400).json({ success: false, message: "User not found!!" });
    }

    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await Notification.findOneAndDelete({
        from: req.user._id,
        to: id,
        type: "follow",
      });
      return res.status(200).json({
        success: true,
        message: `${usertoFollowUnfollow.userName} unfollowed successfully`,
      });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: id,
      });

      await newNotification.save();

      return res.status(200).json({
        success: true,
        message: `${usertoFollowUnfollow.userName} followed successfully`,
      });
    }
  } catch (e) {
    console.error("Error in getUserProfile " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function getSuggestedUser(req, res) {
  try {
    const userId = req.user._id;
    const followedUsers = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: { _id: { $ne: userId } },
      },
      {
        $sample: { size: 10 },
      },
      {
        $project: { password: 0 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !followedUsers.following.includes(user._id)
    );

    res.status(200).json(filteredUsers);
  } catch (e) {
    console.error("Error in getSuggestedUser " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function updateUserProfile(req, res) {
  const { fullname, email, currentPassword, newPassword, bio, link } = req.body;
  let { profileImg, coverImg, username } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!!" });
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide both current and new password." });
    }

    if (currentPassword && newPassword) {
      const isMatch = bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid current password" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      if (newPassword === currentPassword) {
        return res.status(400).json({
          error: "New password should be different from current password",
        });
      }
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email" });
      }
    }

    if (username) {
      username = username.toLowerCase();
    }

    user.fullName = fullname || user.fullName;
    user.userName = username || user.userName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (e) {
    console.error("Error in updateUserProfile " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}
