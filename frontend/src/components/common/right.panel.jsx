import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/right.panel.skeleton.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./loading.spinner.jsx";
import { useQueryClient } from "@tanstack/react-query";

const RightPanel = () => {
  const queryClient = useQueryClient();

  const { data: USERS_FOR_RIGHT_PANEL, isLoading } = useQuery({
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
        queryClient.invalidateQueries(["suggestions"]);
      },
    });

  const displaySkeletons = () => {
    return Array(USERS_FOR_RIGHT_PANEL?.length + 1 || 3).map((_, index) => (
      <RightPanelSkeleton key={index} />
    ));
  };
  console.log(USERS_FOR_RIGHT_PANEL);
  return (
    <div className="hidden lg:block my-4 mx-2">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {isLoading && displaySkeletons()}
          {!isLoading &&
            USERS_FOR_RIGHT_PANEL?.map((user) => (
              <Link
                to={`/profile/${user.userName}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
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
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={() => {
                      followUnfollowUser(user._id);
                    }}
                  >
                    {followingUnfollowPending ? <LoadingSpinner /> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
