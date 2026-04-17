import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Hotel, Star, AlertCircle } from "lucide-react";
import {motion} from "framer-motion";
import StatCard from "../components/Admin/StatCard";
import DashboardCharts from "../components/Admin/DashboardCharts";
import RecentActivityFeed from "../components/Admin/RecentActivityFeed";
import { adminAPI } from "../services/api/adminAPI";
import { delay } from "lodash";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getRecentActivities(5),
        ]);

        if (cancelled) return;

        setStats(statsRes.data.data);
        setActivities(activitiesRes.data.data);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching dashboard data:", error);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ x: 10, opacity: 0, scale: 0 }}
        animate={{ x: 0, opacity: 1, delay: 0.6, scale: 1 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        layout
      >
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome to Admin Control Panel</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.users?.total || 0}
          color="from-blue-500 to-blue-600"
          onClick={() => navigate("/admin/users")}
        />
        <StatCard
          icon={Hotel}
          label="Total Hotels"
          value={stats?.hotels?.total || 0}
          color="from-purple-500 to-purple-600"
          onClick={() => navigate("/admin/analytics")}
        />
        <StatCard
          icon={Star}
          label="Pending Reviews"
          value={stats?.content?.pendingReviews || 0}
          color="from-amber-500 to-amber-600"
          onClick={() => navigate("/admin/reviews")}
        />
        <StatCard
          icon={AlertCircle}
          label="Unresolved Reports"
          value={stats?.reports?.unresolved || 0}
          color="from-red-500 to-red-600"
          onClick={() => navigate("/admin/reports")}
        />
      </div>

      {/* User Distribution & Role Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-200">
              <span>Travellers</span>
              <span className="font-bold text-blue-400">
                {stats?.users?.travellers || 0}
              </span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Verifiers</span>
              <span className="font-bold text-purple-400">
                {stats?.users?.verifiers || 0}
              </span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Admins</span>
              <span className="font-bold text-amber-400">
                {stats?.users?.admins || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-4">Content Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-200">
              <span>Reviews</span>
              <span className="font-bold text-blue-400">
                {stats?.content?.reviews || 0}
              </span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Pending Review</span>
              <span className="font-bold text-red-400">
                {stats?.content?.pendingReviews || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
          <h3 className="text-white font-semibold mb-4">Hotel Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-slate-200">
              <span>Total</span>
              <span className="font-bold text-blue-400">
                {stats?.hotels?.total || 0}
              </span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Verified</span>
              <span className="font-bold text-green-400">
                {stats?.hotels?.verified || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Recent Activity */}
      {activities && <RecentActivityFeed activities={activities} />}
    </div>
  );
};

export default AdminDashboard;
