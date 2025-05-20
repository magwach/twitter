import { useQuery } from "@tanstack/react-query";

export default function getLoggedUser() {
    return ( useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await fetch("/api/auth/user");
            if (res.status === 500) {
                throw new Error("Server Error!!");
            }
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.message);
            }
            return data;
        },
        retry: false,
    }))
}