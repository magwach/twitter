import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export async function createPost(req, res) {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ error: "User not found!!" });
    }

    if (!img && !text) {
      return res
        .status(400)
        .json({ error: "Please provide either text or image!!" });
    }

    if (img) {
      const uploadedImg = await cloudinary.uploader.upload(img);
      img = uploadedImg.secure_url;
    }

    const newPost = new Post({
      owner: userId,
      text: text,
      img: img,
    });
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (e) {
    console.error("Error in createPost " + e);
    res.status(500).json({ error: "Server Error" });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post._id.toString() !== id) {
      console.log(post._id, id);
      return res
        .status(400)
        .json({ error: "You aren't authorized to delete this post" });
    }

    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (e) {
    console.error("Error in deletePost " + e.message);
    res.status(500).json({ error: "Server Error" });
  }
}

export async function commentPost(req, res) {
  try {
    const { text } = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a comment" });
    }

    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    const comment = { text: text, user: userId };
    post.comments.push(comment);
    await post.save();
    const notification = new Notification({
      from: userId,
      to: post.owner,
      type: "comment",
    });
    await notification.save();

    return res.status(200).json({ success: true, data: post });
  } catch (e) {
    console.error("Error in commentPost " + e.message);
    res.status(500).json({ error: "Server Error" });
  }
}

export async function likeUnlikePost(req, res) {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    let post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      let user = await User.findById(userId);
      user.likedPosts = user.likedPosts.filter(
        (post_id) => post_id.toString() !== id.toString()
      );
      await user.save();
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "Post unliked successfully" });
    } else {
      const notification = new Notification({
        from: userId,
        to: post.owner,
        type: "like",
      });
      let user = await User.findById(userId);
      user.likedPosts.push(post._id);
      await user.save();
      await notification.save();
      post.likes.push(userId);
      await post.save();
      return res
        .status(200)
        .json({ success: true, message: "Post liked successfully" });
    }
  } catch (error) {
    console.error("Error in likeUnlikePost " + error.message);
    res.status(500).json({ error: "Server Error" });
  }
}

export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "owner", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "No posts found" });
    }
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.log("Error in getAllPosts " + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function getlikedPosts(req, res) {
  try {
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    let likedPosts = user.likedPosts;
    if (!likedPosts) {
      return res.status(200).json({ message: "No liked posts found" });
    }
    likedPosts = await User.findById(userId)
      .select("-password")
      .populate({
        path: "likedPosts",
        populate: {
          path: "comments.user",
          select: "-password",
        },
        populate: {
          path: "owner",
          select: "-password",
        },
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error in getlikedPosts " + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function getAllFollowingPosts(req, res) {
  try {
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    let following = user.following;
    if (following.length === 0) {
      return res.status(200).json({ message: "You are not following anyone" });
    }
    const posts = await Post.find({ owner: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "owner", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllFollowingPosts " + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

export async function getMyPosts(req, res) {
  try {
    const { username } = req.params;
    console.log(username)
    let user = await User.find({ userName: username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const posts = await Post.find({ owner: user[0]._id })
      .sort({ createdAt: -1 })
      .populate({ path: "owner", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error in getMyPosts " + error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}
