import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

import { FaArrowLeft, FaLink } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

import Posts from "../../components/common/posts.jsx";
import EditProfile from "./edit.profile.jsx";
import ProfileHeaderSkeleton from "../../components/skeletons/profile.header.skeleton.jsx";
import FetchingSpinner from "../../components/common/fetching.spinner.jsx";

import getProfile from "../../components/hooks/get.profile.jsx";
import getLoggedUser from "../../components/hooks/get.looged.user.jsx";

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        if (res.status === 500) throw new Error("Server Error!!");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data;
      } catch (error) {
        toast.error(
          error.message || "Something went wrong while fetching posts"
        );
        throw error;
      }
    },
    retry: false,
  });

  const { data: myPosts, isLoading: postLoading } = useQuery({
    queryKey: ["myPosts", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/post/${username}`);
        if (res.status === 500) throw new Error("Server Error!!");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data;
      } catch (error) {
        toast.error(
          error.message || "Something went wrong while fetching posts"
        );
        throw error;
      }
    },
    retry: false,
  });

  const { data: likedPosts, isLoading: likedPostsLoading } = useQuery({
    queryKey: ["likedPosts", username],
    queryFn: async () => {
      try {
        const res = await fetch("/api/post/posts/liked");
        if (res.status === 500) throw new Error("Server Error!!");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data;
      } catch (error) {
        toast.error(
          error.message || "Something went wrong while fetching posts"
        );
        throw error;
      }
    },
  });

  const { data: loggedUser } = getLoggedUser();
  const { userId: userToFollowUnfolllow, profileLoading } =
    getProfile(username);

  const userProfile = userData?.data;
  const isMyProfile = username === loggedUser?.data?.userName;

  const { mutate: followUnfollowUser, isPending: followingUnfollowPending } =
    useMutation({
      mutationFn: async () => {
        try {
          const res = await fetch(
            `/api/users/follow/${userToFollowUnfolllow}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
          if (res.status === 500) throw new Error("Server Error!!");
          const data = await res.json();
          if (!data.success) throw new Error(data.message || data.error);
          toast.success(data.message);
          return data;
        } catch (error) {
          toast.error(error.message || "Something went wrong");
          throw error;
        }
      },
      onSuccess: () => {
        setIsFollowing((prev) => !prev);
        queryClient.invalidateQueries(["userProfile"]);
        queryClient.invalidateQueries(["suggestions"]);
      },
    });

  const { mutate: updatePictures, isPending } = useMutation({
    mutationKey: ["updatePictures"],
    mutationFn: async () => {
      try {
        const res = await fetch("/api/users/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coverImg, profileImg }),
        });
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        if (res.status === 413) {
          throw new Error("Image size is too large.");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || data.error);
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onMutate: () => {
      toast.loading("Uploading...", { id: "updateToast" });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setCoverImg(null);
      setProfileImg(null);
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
    onSettled: () => {
      toast.dismiss("updateToast");
    },
  });

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (state === "coverImg") setCoverImg(reader.result);
        if (state === "profileImg") setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFollowing = () => {
    if (!profileLoading) followUnfollowUser();
  };

  const date = new Date(userProfile?.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (loggedUser?.data?.following?.includes(userToFollowUnfolllow)) {
      setIsFollowing(true);
    }
  }, [loggedUser, userToFollowUnfolllow]);

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen mb-12 md:mb-0">
      {isLoading && <ProfileHeaderSkeleton />}

      {!isLoading && !userProfile && (
        <p className="text-center text-lg mt-4">User not found</p>
      )}

      {!isLoading && userProfile && (
        <div className="flex flex-col">
          <div className="flex gap-10 px-4 py-2 items-center">
            <Link to="/">
              <FaArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <p className="font-bold text-lg">{userProfile?.fullName}</p>
              <span className="text-sm text-slate-500">
                {myPosts?.data.length} posts
              </span>
            </div>
          </div>

          <div className="relative group/cover">
            <img
              src={coverImg || userProfile?.coverImg || "/cover.png"}
              className="h-52 w-full object-cover"
              alt="cover image"
            />
            {isMyProfile && (
              <div
                className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                onClick={() => coverImgRef.current.click()}
              >
                <MdEdit className="w-5 h-5 text-white" />
              </div>
            )}
            <input
              type="file"
              hidden
              ref={coverImgRef}
              onChange={(e) => handleImgChange(e, "coverImg")}
              accept="image/*"
            />

            <div className="avatar absolute -bottom-16 left-4">
              <div className="w-32 rounded-full relative group/avatar">
                <img
                  src={
                    profileImg ||
                    userProfile?.profileImg ||
                    "/default-profile.jpg"
                  }
                  alt="profile"
                />
                {isMyProfile && (
                  <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                    <MdEdit
                      className="w-4 h-4 text-white"
                      onClick={() => profileImgRef.current.click()}
                    />
                  </div>
                )}
                <input
                  type="file"
                  hidden
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end px-4 mt-5">
            {isMyProfile ? (
              <EditProfile />
            ) : (
              <button
                className="btn btn-outline rounded-full btn-sm"
                onClick={handleFollowing}
              >
                {followingUnfollowPending ? (
                  <FetchingSpinner />
                ) : isFollowing ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </button>
            )}

            {(coverImg || profileImg) && (
              <button
                className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                onClick={() => updatePictures()}
                disabled={isPending}
              >
                Update
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-14 px-4">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{userProfile?.fullName}</span>
              <span className="text-sm text-slate-500">
                @{userProfile?.userName}
              </span>
              <span className="text-sm my-1">{userProfile?.bio}</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {userProfile?.link && (
                <div className="flex gap-1 items-center">
                  <FaLink className="w-3 h-3 text-slate-500" />
                  <a
                    href={userProfile.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {userProfile.link}
                  </a>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">{formattedDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex gap-1 items-center">
                <span className="font-bold text-xs">
                  {userProfile?.following.length}
                </span>
                <span className="text-slate-500 text-xs">Following</span>
              </div>
              <div className="flex gap-1 items-center">
                <span className="font-bold text-xs">
                  {userProfile?.followers.length}
                </span>
                <span className="text-slate-500 text-xs">Followers</span>
              </div>
            </div>
          </div>

          <div className="flex w-full border-b border-gray-700 mt-4">
            <div
              className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
              onClick={() => setFeedType("posts")}
            >
              Posts
              {feedType === "posts" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
              )}
            </div>
            <div
              className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
              onClick={() => setFeedType("likes")}
            >
              Likes
              {feedType === "likes" && (
                <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
              )}
            </div>
          </div>

          <div>
            {feedType === "posts" && myPosts && (
              <Posts posts={myPosts?.data} loading={postLoading} />
            )}
            {feedType === "likes" && likedPosts && (
              <Posts
                posts={likedPosts?.data?.likedPosts}
                loading={likedPostsLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
