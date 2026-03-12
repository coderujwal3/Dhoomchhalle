import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
// import Hotels from "../pages/Hotels";
// import Transport from "../pages/Transport";
// import RoutePlanner from "../pages/RoutePlanner";
// import Timings from "../pages/Timings";
// import Profile from "../pages/Profile";
// import AdminDashboard from "../pages/AdminDashboard";

// Layout
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* <Route path="/hotels" element={<Hotels />} /> */}

          {/* <Route path="/transport" element={<Transport />} /> */}

          {/* <Route path="/route-planner" element={<RoutePlanner />} /> */}

          {/* <Route path="/timings" element={<Timings />} /> */}
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        {/* <Route path="/profile" element={<Profile />} /> */}

        {/* Admin Routes */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;