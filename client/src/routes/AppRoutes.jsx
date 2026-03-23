import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Hotels from "../pages/Hotels";
import HotelDetails from "../pages/HotelDetails";
import UserDashboard from "../pages/UserDashboard";
// import Transport from "../pages/Transport";
// import RoutePlanner from "../pages/RoutePlanner";
// import Timings from "../pages/Timings";
// import Profile from "../pages/Profile";
// import AdminDashboard from "../pages/AdminDashboard";
import NotFound from "../pages/NotFound";

/**
 * Loader
 */
// import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

// Layout
import MainLayout from "../layouts/MainLayout";
import GuestOnlyRoute from "../components/auth/GuestOnlyRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const AppRoutes = () => {
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 4000);
  // }, []);
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-transparent">
  //       <ClimbingBoxLoader color="#36d7b7" size={15} />
  //     </div>
  //   );
  // }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* <Route path="/transport" element={<Transport />} /> */}

          {/* <Route path="/route-planner" element={<RoutePlanner />} /> */}

          {/* <Route path="/timings" element={<Timings />} /> */}
        </Route>

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Login />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <Register />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <GuestOnlyRoute>
              <ResetPassword />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnlyRoute>
              <ForgotPassword />
            </GuestOnlyRoute>
          }
        />

        {/* User Routes */}
        {/* <Route path="/profile" element={<Profile />} /> */}

        {/* Admin Routes */}
        {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
