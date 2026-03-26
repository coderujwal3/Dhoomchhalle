import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  MessageSquare,
  MapPin,
  Cog,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSession, logout } from "../services/auth.service";
import {
  DashboardActions,
  DashboardHeader,
  DashboardProfilePane,
  DashboardReportsTab,
  DashboardReviewsTab,
  DashboardSavedHotelsTab,
  DashboardSettingsTab,
  DashboardSummaryCard,
  DashboardTabButton,
  DashboardTransportTab,
} from "../components/user-dashboard";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const body = await getSession();
        if (!cancelled && body?.data?.user) {
          setUser(body.data.user);
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load your profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Still clear client session
    }
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/", { replace: true });
    setLoggingOut(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-orange-200/50 via-orange-100/20 to-orange-400/30 pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <DashboardHeader />
        </motion.div>

        {loading ? (
          <div className="relative rounded-2xl flex items-center justify-center bg-red-500/30 backdrop-blur-sm p-10 text-center text-white/70 text-4xl font-extrabold tracking-widest">
            Loading your Data...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="overflow-hidden"
            >
              <DashboardSummaryCard user={user} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="flex overflow-x-auto border-b border-border bg-muted/30">
                <DashboardTabButton
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  icon={User}
                  label="Profile"
                />
                <DashboardTabButton
                  active={activeTab === "hotels"}
                  onClick={() => setActiveTab("hotels")}
                  icon={Heart}
                  label="Favorite Hotels"
                />
                <DashboardTabButton
                  active={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                  icon={MessageSquare}
                  label="My Reviews"
                />
                <DashboardTabButton
                  active={activeTab === "transport"}
                  onClick={() => setActiveTab("transport")}
                  icon={MapPin}
                  label="Transport"
                />
                <DashboardTabButton
                  active={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  icon={Cog}
                  label="Settings"
                />
                <DashboardTabButton
                  active={activeTab === "reports"}
                  onClick={() => setActiveTab("reports")}
                  icon={TriangleAlert}
                  label="Reports"
                />
              </div>

              <div className="p-6">
                {activeTab === "profile" && <DashboardProfilePane user={user} />}

                {activeTab === "hotels" && <DashboardSavedHotelsTab />}
                {activeTab === "reviews" && <DashboardReviewsTab />}
                {activeTab === "transport" && <DashboardTransportTab />}
                {activeTab === "settings" && <DashboardSettingsTab />}
                {activeTab === "reports" && <DashboardReportsTab />}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="overflow-hidden"
            >
              <DashboardActions loggingOut={loggingOut} onLogout={handleLogout} />
            </motion.div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default UserDashboard;
