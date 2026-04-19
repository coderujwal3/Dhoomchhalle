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
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const DEFAULT_CENTER = [25.3176, 82.9739];

const HOTSPOT_STATUSES = [
  "monitoring",
  "investigating",
  "enforcement-requested",
  "resolved",
  "ignored",
];

const HOTSPOT_PRIORITIES = ["low", "medium", "high", "critical"];

function hotspotKey(spot) {
  return `${spot.routeKey}::${spot.transportType}`;
}

function statusBadgeClass(status) {
  if (status === "resolved") return "bg-emerald-100 text-emerald-800";
  if (status === "enforcement-requested") return "bg-rose-100 text-rose-800";
  if (status === "investigating") return "bg-amber-100 text-amber-800";
  if (status === "ignored") return "bg-slate-200 text-slate-700";
  return "bg-blue-100 text-blue-800";
}

const AdminAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState([]);
  const [hotelAnalytics, setHotelAnalytics] = useState([]);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [reportsAnalytics, setReportsAnalytics] = useState(null);
  const [fareHotspots, setFareHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [actionDrafts, setActionDrafts] = useState({});
  const [savingActionKey, setSavingActionKey] = useState("");

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
        const hotspots = fareHotspotRes?.data?.data || [];
        setFareHotspots(hotspots);
        setActionDrafts(
          Object.fromEntries(
            hotspots.map((spot) => [
              hotspotKey(spot),
              {
                status: spot.action?.status || spot.suggestedAction || "monitoring",
                priority: spot.action?.priority || "medium",
                notes: spot.action?.notes || "",
              },
            ])
          )
        );
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

  const geoHotspots = fareHotspots.filter(
    (spot) => spot.fromCoordinates?.lat && spot.fromCoordinates?.lng
  );

  const hotspotMapCenter = geoHotspots.length
    ? [
        geoHotspots.reduce((sum, spot) => sum + Number(spot.fromCoordinates.lat), 0) /
          geoHotspots.length,
        geoHotspots.reduce((sum, spot) => sum + Number(spot.fromCoordinates.lng), 0) /
          geoHotspots.length,
      ]
    : DEFAULT_CENTER;

  const updateActionDraft = (spot, key, value) => {
    const rowKey = hotspotKey(spot);
    setActionDrafts((prev) => ({
      ...prev,
      [rowKey]: {
        ...(prev[rowKey] || {
          status: spot.action?.status || spot.suggestedAction || "monitoring",
          priority: spot.action?.priority || "medium",
          notes: spot.action?.notes || "",
        }),
        [key]: value,
      },
    }));
  };

  const saveHotspotAction = async (spot) => {
    const rowKey = hotspotKey(spot);
    const draft = actionDrafts[rowKey] || {};

    try {
      setSavingActionKey(rowKey);
      await adminAPI.updateFareHotspotAction({
        routeKey: spot.routeKey,
        transportType: spot.transportType,
        status: draft.status || "monitoring",
        priority: draft.priority || "medium",
        notes: draft.notes || "",
        lastRiskSnapshot: {
          checks: spot.checks,
          highRiskCount: spot.highRiskCount,
          mediumRiskCount: spot.mediumRiskCount,
          reportedCount: spot.reportedCount,
          avgOverchargePercent: spot.avgOverchargePercent,
        },
      });
      toast.success("Hotspot action updated");

      setFareHotspots((prev) =>
        prev.map((item) =>
          hotspotKey(item) === rowKey
            ? {
                ...item,
                action: {
                  ...(item.action || {}),
                  status: draft.status || "monitoring",
                  priority: draft.priority || "medium",
                  notes: draft.notes || "",
                  updatedAt: new Date().toISOString(),
                },
              }
            : item
        )
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update hotspot action");
    } finally {
      setSavingActionKey("");
    }
  };

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

          <div className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Fare Overcharge Hotspots</h3>
              <p className="text-xs text-slate-300">
                {fareHotspots.length} hotspots in last {days} days
              </p>
            </div>

            {!fareHotspots.length ? (
              <p className="text-slate-300 text-sm">
                No medium/high-risk fare hotspots found in this window.
              </p>
            ) : (
              <>
                <div className="rounded-lg overflow-hidden border border-slate-600">
                  <div className="h-88 w-full">
                    <MapContainer
                      center={hotspotMapCenter}
                      zoom={12}
                      scrollWheelZoom={true}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {geoHotspots.map((spot) => {
                        const from = [spot.fromCoordinates.lat, spot.fromCoordinates.lng];
                        const hasTo = Boolean(
                          spot.toCoordinates?.lat && spot.toCoordinates?.lng
                        );
                        const to = hasTo
                          ? [spot.toCoordinates.lat, spot.toCoordinates.lng]
                          : null;

                        return (
                          <React.Fragment key={`map-${hotspotKey(spot)}`}>
                            <CircleMarker
                              center={from}
                              radius={Math.max(6, Math.min(16, Number(spot.highRiskCount || 1) * 2))}
                              pathOptions={{
                                color: "#ef4444",
                                fillColor: "#f97316",
                                fillOpacity: 0.75,
                              }}
                            >
                              <Popup>
                                <p className="font-semibold">{spot.routeLabel}</p>
                                <p>High-risk checks: {spot.highRiskCount}</p>
                                <p>Avg overcharge: {spot.avgOverchargePercent}%</p>
                                <p>Status: {spot.action?.status || "monitoring"}</p>
                              </Popup>
                            </CircleMarker>
                            {hasTo ? (
                              <Polyline
                                positions={[from, to]}
                                pathOptions={{
                                  color: "#f97316",
                                  weight: 3,
                                  opacity: 0.65,
                                  dashArray: "6 8",
                                }}
                              />
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </MapContainer>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-slate-300 border-b border-slate-600">
                        <th className="py-2 pr-3">Route</th>
                        <th className="py-2 pr-3">Checks</th>
                        <th className="py-2 pr-3">High Risk</th>
                        <th className="py-2 pr-3">Avg Overcharge</th>
                        <th className="py-2 pr-3">Suggested</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fareHotspots.map((spot) => (
                        <tr
                          key={`summary-${hotspotKey(spot)}`}
                          className="border-b border-slate-600/70 text-slate-100"
                        >
                          <td className="py-2 pr-3">
                            <p>{spot.routeLabel}</p>
                            <p className="text-xs text-slate-300 capitalize">
                              {spot.transportType}
                            </p>
                          </td>
                          <td className="py-2 pr-3">{spot.checks}</td>
                          <td className="py-2 pr-3">{spot.highRiskCount}</td>
                          <td className="py-2 pr-3">{spot.avgOverchargePercent}%</td>
                          <td className="py-2 pr-3 capitalize">{spot.suggestedAction}</td>
                          <td className="py-2 pr-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeClass(
                                spot.action?.status
                              )}`}
                            >
                              {spot.action?.status || "monitoring"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-800/70 rounded-lg p-4 ring-1 ring-slate-600">
                  <h4 className="text-white font-semibold mb-3">
                    Action Workflow for Repeated Overcharge Routes
                  </h4>
                  <div className="space-y-3">
                    {fareHotspots.map((spot) => {
                      const rowKey = hotspotKey(spot);
                      const draft = actionDrafts[rowKey] || {
                        status: spot.action?.status || spot.suggestedAction || "monitoring",
                        priority: spot.action?.priority || "medium",
                        notes: spot.action?.notes || "",
                      };
                      const repeatedRisk =
                        Number(spot.checks) >= 4 || Number(spot.highRiskCount) >= 2;

                      return (
                        <div
                          key={`workflow-${rowKey}`}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border border-slate-600 rounded-lg p-3 text-slate-100"
                        >
                          <div className="md:col-span-4">
                            <p className="font-medium text-sm">{spot.routeLabel}</p>
                            <p className="text-xs text-slate-300">
                              Severity {spot.severityScore} | {spot.highRiskCount} high-risk flags
                            </p>
                            {repeatedRisk ? (
                              <p className="text-xs text-amber-300 mt-1">
                                Repeated overcharge route requires admin action.
                              </p>
                            ) : null}
                          </div>
                          <div className="md:col-span-2">
                            <select
                              value={draft.status}
                              onChange={(event) =>
                                updateActionDraft(spot, "status", event.target.value)
                              }
                              className="w-full rounded bg-slate-700 border border-slate-600 px-2 py-2 text-xs capitalize"
                            >
                              {HOTSPOT_STATUSES.map((status) => (
                                <option key={status} value={status} className="capitalize">
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <select
                              value={draft.priority}
                              onChange={(event) =>
                                updateActionDraft(spot, "priority", event.target.value)
                              }
                              className="w-full rounded bg-slate-700 border border-slate-600 px-2 py-2 text-xs capitalize"
                            >
                              {HOTSPOT_PRIORITIES.map((priority) => (
                                <option key={priority} value={priority} className="capitalize">
                                  {priority}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <input
                              value={draft.notes}
                              onChange={(event) =>
                                updateActionDraft(spot, "notes", event.target.value)
                              }
                              placeholder="Add admin note"
                              className="w-full rounded bg-slate-700 border border-slate-600 px-2 py-2 text-xs"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <button
                              type="button"
                              onClick={() => saveHotspotAction(spot)}
                              disabled={savingActionKey === rowKey}
                              className="w-full rounded bg-orange-600 hover:bg-orange-700 px-2 py-2 text-xs font-semibold disabled:opacity-60"
                            >
                              {savingActionKey === rowKey ? "..." : "Save"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
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
