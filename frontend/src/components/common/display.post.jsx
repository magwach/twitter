import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { BsEmojiSmileFill } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import timeAgo from "../utils/date.converter.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ShowImage from "./show.image.jsx";
import toast from "react-hot-toast";
import authQuery from "../utils/authQuery.js";

const Post = ({ post }) => {
  const { data: loggedUser } = authQuery();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const loggedUserName = loggedUser?.data?.userName;
  const postOwner = post.owner;
  const isLiked = loggedUser.data.likedPosts.includes(post._id);

  const isMyPost = loggedUserName === postOwner.userName;

  const formattedDate = timeAgo(post?.createdAt);

  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setComment((prevComment) => prevComment + emoji);
  };

  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/post/delete/${post._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || data.error);
        }
        return data;
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    },
    onMutate: () => {
      toast.loading("Deleting post...", { id: "deletePost" });
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.setQueryData(["allPosts"], (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          data: oldData.data.filter((p) => p._id !== post._id),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
    onSettled: () => {
      toast.dismiss("deletePost");
    },
  });

  const { mutate: likePost } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/post/like/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || data.error);
        }
        return data;
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    },
    onSuccess: (data) => {
      const likes = data.data;
      queryClient.setQueryData(["allPosts"], (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          data: oldData.data.map((p) => {
            if (p._id === post._id) {
              return { ...p, likes: likes };
            }
            return p;
          }),
        };
      });
      queryClient.setQueryData(["authUser"], (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            likedPosts: !isLiked
              ? [...new Set([...oldData.data.likedPosts, post._id])]
              : oldData.data.likedPosts.filter((id) => id !== post._id),
          },
        };
      });
    },
  });

  const { mutate: addComment, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/post/comment/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: comment,
          }),
        });
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || data.error);
        }
        return data;
      } catch (error) {
        toast.error(error.message || "Something went wrong");
      }
    },
    onSuccess: async () => {
      if (!comment) return;
      toast.success("Comment added succesfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
  });

  const handleDeletePost = () => {
    !isPending && deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    !isCommenting && addComment();
  };

  const handleLikePost = () => {
    likePost();
  };

  const handleClick = () => {
    setImgSrc(post.img);
    setShowModal(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.userName}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/default-profile.jpg"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.userName}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.userName}`}>
                @{postOwner.userName}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="w-full max-w-md object-cover rounded-lg border border-gray-700  cursor-pointer"
                alt=""
                onClick={handleClick}
              />
            )}
            {showModal && (
              <ShowImage src={imgSrc} onClose={() => setShowModal(false)} />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <Link to={`/profile/${comment?.user?.userName}`}>
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  comment?.user?.profileImg ||
                                  "/default-profile.jpg"
                                }
                              />
                            </div>
                          </div>
                        </Link>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment?.user?.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment?.user?.userName}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={(e) => handlePostComment(e)}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex flex-col align-middle justify-center gap-2">
                      <BsEmojiSmileFill
                        className={`${
                          showEmojiPicker ? "fill-amber-300" : "fill-primary"
                        } w-7 h-7 cursor-pointer self-center `}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      />
                      <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isCommenting ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </form>
                  {showEmojiPicker && (
                    <div className="z-10 self-center">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width={windowWidth < 768 ? "100%" : "350px"}
                        height={windowWidth < 768 ? "300px" : "400px"}
                        previewConfig={{ showPreview: windowWidth >= 640 }}
                      />
                    </div>
                  )}
                </div>

                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {!isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-red-500" />
                )}
                {isLiked && (
                  <FaHeart className="w-4 h-4 cursor-pointer text-red-500 " />
                )}

                <span
                  className={`text-sm text-slate-500 group-hover:text-red-500 ${
                    isLiked ? "text-red-500" : ""
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
