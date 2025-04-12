import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const converterdUserName = username.toLowerCase();

    const user = await User.findOne({ userName: converterdUserName });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      success: true,
      message: `${user.userName} successfully logged in`,
    });
  } catch (e) {
    console.error("Error loging in " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function logout(req, res) {
  try {
    if (!req.cookies.jwt) {
      return res
        .status(400)
        .json({ success: false, message: "No user is currently logged on" });
    }
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    console.error("Error logging out " + e);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function signup(req, res) {
  try {
    const { username, fullname, email, password } = req.body;
    const converterdUserName = username.toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const existingUser = await User.findOne({ userName: converterdUserName });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `${existingUser.userName} already exists`,
      });
    }

    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email ${existingEmail.email} already exists`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullname,
      userName: converterdUserName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        likedPosts: newUser.likedPosts,
        success: true,
        message: `${username} successfully added`,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    console.error("Error in get user Controller" + e);
    res.status(500).json({ error: "Server error" });
  }
}
