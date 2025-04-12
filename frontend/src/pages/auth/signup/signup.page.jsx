import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svgs/x.jsx";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });
  const navigate = useNavigate();

  const {
    mutate: signUp,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const res = await fetch("api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            fullname,
            password,
          }),
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
        toast.error(error.message || "Something went wrong");
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setFormData({
        email: "",
        username: "",
        fullname: "",
        password: "",
      });
      navigate("/login");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex sm:flex-col md:flex-col items-center justify-center">
        <XSvg className={"lg:w-2/3 fill-white"} />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg
            className={"lg:hidden w-32 h-32 fill-white self-center mb-4 "}
          />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
              autoComplete="off"
              required
            />
          </label>
          <div className="flex gap-4 flex-wrap sm:flex-col md:flex-col ">
            <label className="input input-bordered rounded flex items-center flex-1">
              <FaUser />
              <input
                type="text"
                className="grow sm:h-14 md:h-14"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
                autoComplete="off"
                required
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullname"
                onChange={handleInputChange}
                value={formData.fullname}
                autoComplete="off"
                required
              />
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
              autoComplete="off"
              required
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign up"}
          </button>
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-secondary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
