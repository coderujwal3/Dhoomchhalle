import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";

// Pages
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Hotels = lazy(() => import("../pages/Hotels"));
const RoutePlanner = lazy(() => import("../pages/RoutePlanner"));
const Transport = lazy(() => import("../pages/Transport"));
const Timings = lazy(() => import("../pages/Timings"));
const FareCheck = lazy(() => import("../pages/FareCheck"));
const HotelDetails = lazy(() => import("../components/hotels/HotelDetails"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const UserProfile = lazy(() => import("../pages/UserProfile"));
const Contributors = lazy(() => import("../pages/Contributors"));
// import RoutePlanner from "../pages/RoutePlanner";
// import Profile from "../pages/Profile";
// import AdminDashboard from "../pages/AdminDashboard";
const NotFound = lazy(() => import("../pages/NotFound"));

// Layout
import MainLayout from "../layouts/MainLayout";
import GuestOnlyRoute from "../components/auth/GuestOnlyRoute";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ScrollToTop from "../utils/ScrollToTop";
import adminRoutes from "./adminRoutes";

const AppRoutes = () => {

  return (
    <BrowserRouter>
      {/* On opening any next page, the view section move to top of the page, because vercel creates an SPA issue
      - When navigating between routes, the scroll position is preserved instead of resetting to top */}
      <ScrollToTop />

      {/* All routes of page */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-transparent">
            <ClimbingBoxLoader color="#36d7b7" size={15} />
          </div>
        }
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />

            <Route path="/hotels" element={<Hotels />} />
            <Route path="/route-planner" element={<RoutePlanner />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/timings" element={<Timings />} />
            <Route path="/fare-check" element={<FareCheck />} />
            <Route path="/contributors" element={<Contributors />} />
            
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/hotel/:hotel_id" element={<HotelDetails />} />

            <Route path="/user/:id" element={<UserProfile />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

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

          {/* Admin Routes */}
          {adminRoutes}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
