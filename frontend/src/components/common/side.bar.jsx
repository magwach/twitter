import XSvg from "../svgs/x.jsx";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import authQuery from "../utils/authQuery.js";

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { data } = authQuery();
  let userData = data.data;

  const { mutate: signOut } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        toast.error(error.message || "Logout failed!!");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });

  const handleLogout = () => {
    signOut();
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };


  return (
    <div className="fixed bottom-0 left-0 w-full md:relative md:w-52 md:max-w-52 md:flex-[2_2_0%] bg-black/20 md:opacity-100 backdrop-blur-sm ">
      <div className="flex md:flex-col md:h-screen md:sticky md:top-0 md:left-0 border-t md:border-t-0 md:border-r border-gray-700  w-full md:w-full">
        <Link to="/" className="hidden lg:flex lg:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex justify-around w-full md:flex-col md:gap-3 md:mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex flex-col md:flex-row gap-1 md:gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-3 md:pl-2 md:pr-4 md:max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-xs md:text-lg md:hidden">Home</span>
              <span className="hidden md:block text-lg">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex flex-col md:flex-row gap-1 md:gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-3 md:pl-2 md:pr-4 md:max-w-fit cursor-pointer"
            >
              <IoNotifications className="w-6 h-6" />
              <span className="text-xs md:text-lg md:hidden">
                Notifications
              </span>
              <span className="hidden md:block text-lg">Notifications</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${userData?.userName}`}
              className="flex flex-col md:flex-row gap-1 md:gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-3 md:pl-2 md:pr-4 md:max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-xs md:text-lg md:hidden">Profile</span>
              <span className="hidden md:block text-lg">Profile</span>
            </Link>
          </li>
          {userData && (
            <li className="flex justify-center md:hidden">
              <button
                onClick={handleLogout}
                className="flex flex-col gap-1 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 px-3 cursor-pointer"
              >
                <BiLogOut className="w-6 h-6 hover:text-rose-400" />
                <span className="text-xs">Logout</span>
              </button>
            </li>
          )}
        </ul>
        {userData && (
          <div className="hidden md:flex mt-auto mb-10 items-center justify-between transition-all duration-300 py-2 px-4">
            <Link
              to={`/profile/${userData.userName}`}
              className="flex items-start gap-3 hover:bg-stone-900 rounded-full"
            >
              <div className="avatar inline-flex ">
                <div className="w-8 rounded-full">
                  <img src={userData?.profileImg || "/default-profile.jpg"} />
                </div>
              </div>
              <div className="flex flex-col justify-start text-left">
                <p className="text-white font-bold text-sm w-20 truncate ">
                  {userData?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{userData?.userName}</p>
              </div>
            </Link>
            <BiLogOut
              className="w-5 h-5 cursor-pointer self-center hover:text-rose-400"
              onClick={handleLogout}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
