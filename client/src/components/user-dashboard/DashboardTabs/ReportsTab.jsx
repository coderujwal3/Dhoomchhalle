import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createReport, getMyReports } from "../../../services/report.service";

export function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    entityType: "hotel",
    entityId: "",
    category: "other",
    description: "",
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyReports(page, 10);
      setReports(result.data?.reports || []);
      setPagination(result.data?.pagination || null);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.entityId.trim() || !form.description.trim()) {
      toast.error("Entity ID and description are required");
      return;
    }

    try {
      setSubmitting(true);
      await createReport({
        ...form,
        entityId: form.entityId.trim(),
        description: form.description.trim(),
      });
      toast.success("Report submitted successfully");
      setForm((prev) => ({ ...prev, entityId: "", description: "" }));
      setPage(1);
      await fetchReports();
    } catch (error) {
      toast.error(error?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading reports...</div>;

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <select
          name="entityType"
          value={form.entityType}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md"
        >
          <option value="hotel">Hotel</option>
          <option value="review">Review</option>
          <option value="transport">Transport</option>
          <option value="other">Other</option>
        </select>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md"
        >
          <option value="spam">Spam</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="false-info">False Info</option>
          <option value="offensive">Offensive</option>
          <option value="scam">Scam</option>
          <option value="other">Other</option>
        </select>
        <input
          name="entityId"
          value={form.entityId}
          onChange={handleChange}
          placeholder="Entity ID (Mongo ObjectId)"
          className="px-3 py-2 border rounded-md md:col-span-2"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe the issue..."
          className="px-3 py-2 border rounded-md md:col-span-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      {!reports.length ? (
        <p className="text-sm text-gray-600 text-center py-6">
          No reports submitted yet.
        </p>
      ) : (
        reports.map((report) => (
          <div key={report._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold capitalize">
                {report.entityType} - {report.category}
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 capitalize">
                {report.status}
              </span>
            </div>
            <p className="text-sm text-gray-700">{report.description}</p>
          </div>
        ))
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 bg-orange-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
