import { useQuery } from "@tanstack/react-query";

export default function authQuery() {
  return useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/user");
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
        throw error;
      }
    },
    retry: false,
  });
}
