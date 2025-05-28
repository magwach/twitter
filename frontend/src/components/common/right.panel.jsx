import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/right.panel.skeleton.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import FetchingSpinner from "./fetching.spinner.jsx";
import toast from "react-hot-toast";

const RightPanel = () => {
  const queryClient = useQueryClient();
  const [followingIndex, setFollowingIndex] = useState(null);

  const {
    data: USERS_FOR_RIGHT_PANEL,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["suggestions"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested");
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || data.error);
        }
        return data?.data;
      } catch (error) {
        throw error;
      }
    },
  });

  const { mutate: followUnfollowUser, isPending: followingUnfollowPending } =
    useMutation({
      mutationFn: async (userToFollowUnfolllow) => {
        try {
          setFollowingIndex(userToFollowUnfolllow);
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
        setFollowingIndex(null);
        queryClient.invalidateQueries(["suggestions"]);
        refetch();
      },
      onError: () => {
        setFollowingIndex(null);
      },
    });

  const displaySkeletons = () => {
    return Array(USERS_FOR_RIGHT_PANEL?.length + 1 || 3).map((_, index) => (
      <RightPanelSkeleton key={index} />
    ));
  };
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {isLoading && displaySkeletons()}
          {USERS_FOR_RIGHT_PANEL?.length === 0
            ? "You're already following everyone 🎉"
            : !isLoading &&
              USERS_FOR_RIGHT_PANEL?.map((user) => (
                <div className="flex" key={user._id}>
                  <Link
                    to={`/profile/${user.userName}`}
                    className="flex items-center justify-between gap-4"
                    key={user._id}
                    onClick={() => {
                      queryClient.invalidateQueries(["userProfile"]);
                      queryClient.invalidateQueries(["myPosts"]);
                      queryClient.invalidateQueries(["likedPosts"]);
                    }}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={user.profileImg || "/default-profile.jpg"}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-tight truncate w-28">
                          {user.fullName}
                        </span>
                        <span className="text-sm text-slate-500">
                          @{user.userName}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div>
                    <button
                      className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                      onClick={() => {
                        followUnfollowUser(user._id);
                      }}
                    >
                      {followingUnfollowPending &&
                      followingIndex === user._id ? (
                        <FetchingSpinner />
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
