import Post from "./display.post.jsx";
import PostSkeleton from "../skeletons/post.skeleton.jsx";

const Posts = ({ posts, isLoading, feedType }) => {
  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading &&
        posts.length === 0 &&
        (feedType === "following" ? (
          <p className="text-center my-4v">
            You are not following anyone. Follow someone to see their posts.
          </p>
        ) : (
          <p className="text-center my-4v">No posts.</p>
        ))}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
