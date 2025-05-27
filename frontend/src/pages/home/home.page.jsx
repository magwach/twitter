import { useState } from "react";

import Posts from "../../components/common/posts.jsx";
import CreatePost from "./create.post.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["allPosts"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/post/posts/all");
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
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
  console.log(postsData);
  const { data: followingPostsData, followingIsLoading } = useQuery({
    queryKey: ["followingPosts"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/post/posts/following");
        if (res.status === 500) {
          throw new Error("Server Error!!");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    retry: false,
  });

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen w-full mb-12 md:mb-0">
        <div className="flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            For you
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {feedType === "forYou" && (
          <>
            <CreatePost />
            <Posts posts={postsData?.data} isLoading={isLoading} />
          </>
        )}
        {feedType === "following" && (
          <Posts
            feedType={"following"}
            posts={followingPostsData?.data}
            isLoading={followingIsLoading}
          />
        )}
      </div>
    </>
  );
};
export default HomePage;
