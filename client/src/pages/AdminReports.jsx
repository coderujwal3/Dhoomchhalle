import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api/adminAPI";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("unresolved");
  const [expandedReport, setExpandedReport] = useState(null);
  const [resolutionText, setResolutionText] = useState({});

  async function fetchReports() {
    try {
      setLoading(true);
      const response = await adminAPI.getAllReports(
        currentPage,
        10,
        statusFilter,
      );
      setReports(response.data.data.reports);
      setTotalPages(response.data.data.pagination.pages);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch reports");
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllReports(
          currentPage,
          10,
          statusFilter,
        );

        if (cancelled) return;

        setReports(response.data.data.reports);
        setTotalPages(response.data.data.pagination.pages);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || "Failed to fetch reports");
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentPage, statusFilter]);

  const handleResolveReport = async (reportId) => {
    const resolution = resolutionText[reportId] || "Report resolved by admin";
    try {
      await adminAPI.resolveReport(reportId, resolution);
      toast.success("Report resolved");
      setResolutionText({ ...resolutionText, [reportId]: "" });
      setExpandedReport(null);
      fetchReports();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resolve report");
    }
  };

  return (
    <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Reports Management
        </h1>
        <p className="text-slate-400">Handle user and content reports</p>
      </div>

      {/* Status Filter */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6 ring-1 ring-slate-600">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setStatusFilter("unresolved");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded font-semibold transition ${
              statusFilter === "unresolved"
                ? "bg-blue-600 text-white"
                : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => {
              setStatusFilter("resolved");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded font-semibold transition ${
              statusFilter === "resolved"
                ? "bg-green-600 text-white"
                : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : reports.length > 0 ? (
          <>
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-slate-700 rounded-lg p-6 ring-1 ring-slate-600 hover:ring-slate-500 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h3 className="text-white font-semibold">
                        {report.reason || "Report"}
                      </h3>
                    </div>
                    <p className="text-slate-300 text-sm mb-2">
                      {report.description || "No description provided"}
                    </p>
                    <div className="flex gap-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                      <span>Reported by: {report.reportedBy || "Unknown"}</span>
                    </div>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-semibold ${
                      report.resolved
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {report.resolved ? "Resolved" : "Pending"}
                  </span>
                </div>

                {/* Details about reported content */}
                {report.contentType && (
                  <div className="bg-slate-600 rounded p-3 mb-4">
                    <p className="text-slate-300 text-sm">
                      <span className="font-semibold">Type:</span>{" "}
                      {report.contentType}
                    </p>
                    {report.contentId && (
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold">Content ID:</span>{" "}
                        {report.contentId}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {!report.resolved && (
                  <>
                    <button
                      onClick={() =>
                        setExpandedReport(
                          expandedReport === report._id ? null : report._id,
                        )
                      }
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition mb-3"
                    >
                      {expandedReport === report._id
                        ? "Cancel"
                        : "Resolve Report"}
                    </button>

                    {expandedReport === report._id && (
                      <div className="mt-4 pt-4 border-t border-slate-500">
                        <textarea
                          placeholder="Enter resolution details..."
                          value={resolutionText[report._id] || ""}
                          onChange={(e) =>
                            setResolutionText({
                              ...resolutionText,
                              [report._id]: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none mb-3"
                          rows="3"
                        />
                        <button
                          onClick={() => handleResolveReport(report._id)}
                          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                  </>
                )}

                {report.resolved && (
                  <div className="bg-green-900 bg-opacity-30 rounded p-3">
                    <p className="text-green-300 text-sm">
                      <span className="font-semibold">Resolution:</span>{" "}
                      {report.resolution}
                    </p>
                    <p className="text-green-300 text-xs mt-1">
                      Resolved at:{" "}
                      {new Date(report.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg ring-1 ring-slate-600">
              <p className="text-sm text-slate-300">
                Page{" "}
                <span className="font-semibold text-white">{currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold text-white">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-300 hover:text-white disabled:opacity-50 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-700 rounded-lg p-8 ring-1 ring-slate-600 text-center">
            <p className="text-slate-300 text-lg">
              No {statusFilter} reports found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
