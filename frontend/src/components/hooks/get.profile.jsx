import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function getProfile(username) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["getUserId"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        toast.error(error.message || "Something went wrong");
        navigate("/");
        throw error;
      }
    },
    retry: false,
  });

  return { userId: data?.data?._id, profileLoading: isLoading };
}
