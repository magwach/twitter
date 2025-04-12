import "./App.css";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home/home.page.jsx";
import LoginPage from "./pages/auth/login/login.page.jsx";
import SignUpPage from "./pages/auth/signup/signup.page.jsx";
import Sidebar from "./components/common/side.bar.jsx";
import RightPanel from "./components/common/right.panel.jsx";
import NotificationPage from "./pages/notification/notification.page.jsx";
import ProfilePage from "./pages/profile/profile.page.jsx";
import toast, { Toaster } from "react-hot-toast";
import { CgDanger } from "react-icons/cg";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/loading.spinner.jsx";

function App() {
  const location = useLocation();
  const hidePanels =
    location.pathname === "/login" || location.pathname === "/signup";

  const { data: AuthenticatedUser, isLoading, isError } = useQuery({
    queryKey: ["authUser"],
    enabled: !hidePanels,
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
        throw error
      }
    },
    retry: false,
  });


  return isLoading ? (
    <div className="flex items-center justify-center w-screen h-screen z-50">
      <LoadingSpinner />
    </div>
  ) : isError ? (
    <div className="flex flex-col items-center justify-center w-screen h-screen z-50">
      <CgDanger size={30} />
      <p>You are not authenticated</p>
      <p>
        <a
          href="/login"
          onClick={() => (window.location.href = "/login")}
          className="text-[rgb(29,161,242)]"
        >
          Please Login
        </a>
      </p>
    </div>
  ) : (
    <div className="container flex max-w-6xl mx-auto">
      {!hidePanels && <Sidebar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      {!hidePanels && <RightPanel />}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
