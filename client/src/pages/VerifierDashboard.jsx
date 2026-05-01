import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import VerifierLayout from "../components/Verifier/VerifierLayout";
import { getDashboardStats } from "../services/api/verifierAPI";
import toast from "react-hot-toast";

const VerifierDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <VerifierLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </VerifierLayout>
    );
  }

  const statCards = [
    {
      title: "Pending Reviews",
      value: stats?.pending || 0,
      icon: MessageSquare,
      color: "from-yellow-500 to-orange-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Approved",
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-600",
    },
    {
      title: "Rejected",
      value: stats?.rejected || 0,
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      textColor: "text-red-600",
    },
    {
      title: "Total Reviews",
      value: stats?.total || 0,
      icon: TrendingUp,
      color: "from-blue-500 to-purple-500",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        Stats Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">{card.title}</p>
                    <p className="text-3xl font-bold text-white">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`bg-linear-to-br ${card.color} p-3 rounded-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Approval Rate */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Approval Rate
          </h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-linear-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{
                    width: `${stats?.approvalRate || 0}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-400">
              {stats?.approvalRate || 0}%
            </span>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/verifier/reviews/pending"
              className="bg-linear-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:scale-101 transition-all duration-500"
            >
              Review Pending Items ({stats?.pending || 0})
            </a>
            <a
              href="/verifier/reviews/approved"
              className="bg-linear-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg hover:scale-101 transition-all duration-500"
            >
              View Approved ({stats?.approved || 0})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
