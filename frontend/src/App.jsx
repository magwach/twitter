import "./App.css";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./pages/home/home.page.jsx";
import LoginPage from "./pages/auth/login/login.page.jsx";
import SignUpPage from "./pages/auth/signup/signup.page.jsx";
import Sidebar from "./components/common/side.bar.jsx";
import RightPanel from "./components/common/right.panel.jsx";
import NotificationPage from "./pages/notification/notification.page.jsx";
import ProfilePage from "./pages/profile/profile.page.jsx";
import toast, { Toaster } from "react-hot-toast";
import { CgDanger } from "react-icons/cg";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/loading.spinner.jsx";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const hidePanels =
    location.pathname === "/login" || location.pathname === "/signup";

  const {
    data: AuthenticatedUser,
    isLoading,
    isError,
  } = useQuery({
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
        throw error;
      }
    },
    retry: false,
  });
  console.log(AuthenticatedUser, isError, isLoading);

  if (isError && !hidePanels) {
    toast.error("Session expired, please login again", {
      icon: <CgDanger />,
    });
    navigate("/login");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
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
