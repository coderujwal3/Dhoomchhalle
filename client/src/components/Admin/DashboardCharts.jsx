import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { adminAPI } from "../../services/api/adminAPI";

const DashboardCharts = () => {
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [hotelAnalytics, setHotelAnalytics] = useState([]);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const [userRes, hotelRes, revenueRes] = await Promise.all([
          adminAPI.getUserAnalytics(30),
          adminAPI.getHotelAnalytics(30),
          adminAPI.getRevenueStats("month"),
        ]);

        if (cancelled) return;

        setUserAnalytics(userRes.data.data.dailyData);
        setHotelAnalytics(hotelRes.data.data.dailyData);
        setRevenueData(revenueRes.data.data);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching analytics:", error);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const pieData = [
    { name: "Trending Up", value: 65 },
    { name: "Stable", value: 25 },
    { name: "Down", value: 10 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* User Growth Chart */}
      <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
        <h3 className="text-white font-semibold mb-4">
          User Growth (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userAnalytics}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3b82f6"
              dot={{ fill: "#3b82f6", r: 4 }}
              strokeWidth={2}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hotel Analytics Chart */}
      <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
        <h3 className="text-white font-semibold mb-4">
          Hotel Registration (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
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
            <Legend />
            <Bar
              dataKey="hotels"
              fill="#8b5cf6"
              name="New Hotels"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
        <h3 className="text-white font-semibold mb-4">Revenue Statistics</h3>
        <div className="space-y-4">
          <div>
            <p className="text-slate-300 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-green-400">
              ${revenueData?.totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-600 rounded p-3">
              <p className="text-slate-300 text-xs">Avg Transaction</p>
              <p className="text-xl font-bold text-blue-400">
                ${revenueData?.avgRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-slate-600 rounded p-3">
              <p className="text-slate-300 text-xs">Transactions</p>
              <p className="text-xl font-bold text-purple-400">
                {revenueData?.transactionCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Trend Pie Chart */}
      <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600">
        <h3 className="text-white font-semibold mb-4">Market Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
              }}
              labelStyle={{ color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
