import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaTrash } from "react-icons/fa6";
import FetchingSpinner from "../../components/common/fetching.spinner.jsx";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ["authUser"],
  });
  const userId = userData?.data?._id;

  let { data: notifications, isLoading: loadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("api/notifications");
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        return data;
      } catch (error) {
        toast.error(
          error.message || "Something went wrong getting notifications"
        );
        throw error;
      }
    },
  });
  notifications = notifications?.data;

  const { mutate: deleteNotifications, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/notifications/delete/${userId}`, {
          method: "DELETE",
        });
        if (res.status === 500) {
          toast.error("Server Error!!");
          throw new Error("Server Error!!");
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
      toast.loading("Deleting notifications...", { id: "deleteToast" });
    },
    onSuccess: () => {
      toast.success("Notifications deleted!", { id: "deleteToast" });
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`, { id: "deleteToast" });
    },
  });

  const handleClick = () => {
    if (userId && !isPending) {
      deleteNotifications();
    }
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen mb-15">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown dropdown-left">
            <div tabIndex={0} role="button" className="m-1">
              <FaTrash className="cursor-pointer" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={handleClick}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {loadingNotifications && (
          <div className="flex justify-center h-full items-center">
            <FetchingSpinner />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications </div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {notification.type === "follow" && (
                <FaUser className="w-7 h-7 text-primary" />
              )}
              {notification.type === "like" && (
                <FaHeart className="w-7 h-7 text-red-500" />
              )}
              {notification.type === "comment" && (
                <FaRegComment className="w-7 h-7 text-primary" />
              )}
              <Link to={`/profile/${notification.from.userName}`}>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg || "/default-profile.jpg"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold">
                    @{notification.from.userName}
                  </span>
                  {notification.type === "follow"
                    ? "followed you"
                    : notification.type === "like"
                    ? "liked your post"
                    : "commented on your post"}
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default NotificationPage;
