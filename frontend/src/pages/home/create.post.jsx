import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import getLoggedUser from "../../components/hooks/get.looged.user";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const queryClient = useQueryClient();

  const imgRef = useRef(null);

  const { data } = getLoggedUser();

  const { mutate: post, isPending } = useMutation({
    mutationKey: ["createPost"],
    mutationFn: async () => {
      try {
        const res = await fetch("/api/post/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
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
      toast.loading("Posting...", { id: "postToast" });
    },
    onSuccess: () => {
      toast.success("Post created successfully!");
      setText("");
      setImg(null);
      imgRef.current.value = null;
      setShowEmojiPicker(false);
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
    onSettled: () => {
      toast.dismiss("postToast");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    !isPending && post();
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        imgRef.current.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setText((prevText) => prevText + emoji);
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={data?.data?.profileImg || "/default-profile.jpg"} />
        </div>
      </div>
      <form
        className="flex flex-col gap-2 w-full"
        onSubmit={(e) => handleSubmit(e)}
      >
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill
              className={`${
                showEmojiPicker ? "fill-amber-300" : "fill-primary"
              } w-5 h-5 cursor-pointer `}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button
            className="btn btn-primary rounded-full btn-sm text-white px-4"
            type="submit"
            disabled={isPending}
          >
            Post
          </button>
        </div>
      </form>
      {showEmojiPicker && (
        <div className="z-10 self-center">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={windowWidth < 768 ? "100%" : "350px"}
            height={windowWidth < 768 ? "300px" : "400px"}
            previewConfig={{ showPreview: windowWidth >= 640 }}
            searchDisabled={windowWidth < 480}
          />
        </div>
      )}
    </div>
  );
};
export default CreatePost;
