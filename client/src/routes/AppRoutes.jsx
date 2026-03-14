import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
// import Login from "../pages/Login";
// import Register from "../pages/Register";
// import Hotels from "../pages/Hotels";
// import Transport from "../pages/Transport";
// import RoutePlanner from "../pages/RoutePlanner";
// import Timings from "../pages/Timings";
// import Profile from "../pages/Profile";
// import AdminDashboard from "../pages/AdminDashboard";
import NotFound from "../pages/NotFound";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

// Layout
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <ClimbingBoxLoader color="#36d7b7" size={15} />
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="*" element={<NotFound />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* <Route path="/hotels" element={<Hotels />} /> */}

          {/* <Route path="/transport" element={<Transport />} /> */}

          {/* <Route path="/route-planner" element={<RoutePlanner />} /> */}

          {/* <Route path="/timings" element={<Timings />} /> */}
        </Route>

        {/* Auth Routes */}
        {/* <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} /> */}

        {/* User Routes */}
        {/* <Route path="/profile" element={<Profile />} /> */}

        {/* Admin Routes */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
