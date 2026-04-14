import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const AdminAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [hotelAnalytics, setHotelAnalytics] = useState([]);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [reportsAnalytics, setReportsAnalytics] = useState(null);
  const [fareHotspots, setFareHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        setLoading(true);
        const [userRes, hotelRes, bookingRes, reportsRes, fareHotspotRes] =
          await Promise.all([
          adminAPI.getUserAnalytics(days),
          adminAPI.getHotelAnalytics(days),
          adminAPI.getBookingAnalytics(),
          adminAPI.getReportsAnalytics(),
          adminAPI.getFareCheckHotspots(days, 10, "medium"),
        ]);

        if (cancelled) return;

        setUserAnalytics(userRes.data.data.dailyData);
        setHotelAnalytics(hotelRes.data.data.dailyData);
        setBookingAnalytics(bookingRes.data.data);
        setReportsAnalytics(reportsRes.data.data);
        setFareHotspots(fareHotspotRes?.data?.data || []);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || "Failed to fetch analytics");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-slate-400">
            Detailed system analytics and metrics
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Growth Chart */}
          <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
            <h3 className="text-white font-semibold mb-4">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={userAnalytics}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hotel Growth Chart */}
          <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
            <h3 className="text-white font-semibold mb-4">
              Hotel Registration Trend
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={hotelAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar
                  dataKey="hotels"
                  fill="#8b5cf6"
                  name="New Hotels"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Analytics */}
            <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
              <h3 className="text-white font-semibold mb-4">
                Booking Analytics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Total Bookings</p>
                  <p className="text-4xl font-bold text-blue-400">
                    {bookingAnalytics?.totalBookings || 0}
                  </p>
                </div>
                <div className="h-px bg-slate-600"></div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${bookingAnalytics?.totalRevenue?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {bookingAnalytics?.averageRating || "0.0"} / 5
                  </p>
                </div>
              </div>
            </div>

            {/* Reports Analytics */}
            <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
              <h3 className="text-white font-semibold mb-4">
                Reports Analytics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Total Reports</p>
                  <p className="text-4xl font-bold text-red-400">
                    {reportsAnalytics?.total || 0}
                  </p>
                </div>
                <div className="h-px bg-slate-600"></div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-400">
                    {reportsAnalytics?.resolved || 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-300 text-sm mb-1">Resolution Rate</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {reportsAnalytics?.resolutionRate || "0"}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
            <h3 className="text-white font-semibold mb-4">
              Fare Overcharge Hotspots
            </h3>
            {!fareHotspots.length ? (
              <p className="text-slate-300 text-sm">
                No medium/high-risk fare hotspots found in this window.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-300 border-b border-slate-600">
                      <th className="py-2 pr-3">Route</th>
                      <th className="py-2 pr-3">Transport</th>
                      <th className="py-2 pr-3">Checks</th>
                      <th className="py-2 pr-3">High Risk</th>
                      <th className="py-2 pr-3">Reported</th>
                      <th className="py-2 pr-3">Avg Overcharge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fareHotspots.map((spot) => (
                      <tr
                        key={`${spot.routeKey}-${spot.transportType}`}
                        className="border-b border-slate-600/70 text-slate-100"
                      >
                        <td className="py-2 pr-3">{spot.routeLabel}</td>
                        <td className="py-2 pr-3 capitalize">
                          {spot.transportType}
                        </td>
                        <td className="py-2 pr-3">{spot.checks}</td>
                        <td className="py-2 pr-3">{spot.highRiskCount}</td>
                        <td className="py-2 pr-3">{spot.reportedCount}</td>
                        <td className="py-2 pr-3">
                          {spot.avgOverchargePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Comparative Analysis */}
          <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
            <h3 className="text-white font-semibold mb-4">
              Comparative Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={userAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis yAxisId="left" stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  yAxisId="left"
                  name="Users"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
