import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import {
  createTransportLog,
  deleteTransportLog,
  getMyTransportLogs,
} from "../../../services/transportLog.service";

export function TransportTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [form, setForm] = useState({
    transportType: "e-rickshaw",
    fromLocation: "",
    toLocation: "",
    fare: "",
    journeyDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyTransportLogs(page, 10);
      setLogs(result.data?.logs || []);
      setPagination(result.data?.pagination || null);
    } catch (error) {
      toast.error("Failed to load transport logs");
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!form.fromLocation.trim() || !form.toLocation.trim()) {
      toast.error("From and to locations are required");
      return;
    }
    if (Number(form.fare) < 0 || form.fare === "") {
      toast.error("Fare must be a valid non-negative number");
      return;
    }

    try {
      setSubmitting(true);
      await createTransportLog({
        transportType: form.transportType,
        fromLocation: form.fromLocation.trim(),
        toLocation: form.toLocation.trim(),
        fare: Number(form.fare),
        journeyDate: form.journeyDate,
        notes: form.notes.trim(),
      });
      toast.success("Transport log added");
      setForm((prev) => ({
        ...prev,
        fromLocation: "",
        toLocation: "",
        fare: "",
        notes: "",
      }));
      setPage(1);
      await fetchLogs();
    } catch (error) {
      toast.error(error?.message || "Failed to add transport log");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Delete this transport log?")) return;
    try {
      await deleteTransportLog(logId);
      toast.success("Transport log deleted");
      setLogs((prev) => prev.filter((log) => log._id !== logId));
    } catch {
      toast.error("Failed to delete transport log");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transport history...</div>;
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreateLog}
        className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <select
          name="transportType"
          value={form.transportType}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md"
        >
          <option value="petrol-auto">Petrol Auto</option>
          <option value="cng-auto">CNG Auto</option>
          <option value="e-rickshaw">E-Rickshaw</option>
          <option value="bus-ac">AC Bus</option>
          <option value="bus-non-ac">Non-AC Bus</option>
          <option value="janrath">Janrath</option>
          <option value="train">Train</option>
          <option value="ropeway">Ropeway</option>
        </select>
        <input
          name="fare"
          type="number"
          min="0"
          step="0.01"
          value={form.fare}
          onChange={handleChange}
          placeholder="Fare (INR)"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="fromLocation"
          value={form.fromLocation}
          onChange={handleChange}
          placeholder="From location"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="toLocation"
          value={form.toLocation}
          onChange={handleChange}
          placeholder="To location"
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="journeyDate"
          type="date"
          value={form.journeyDate}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md"
        />
        <input
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (optional)"
          className="px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={submitting}
          className="md:col-span-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add Transport Log"}
        </button>
      </form>

      {!logs || logs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No transport history yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start logging your journeys to see them here.
          </p>
        </div>
      ) : (
        logs.map((log) => (
          <div key={log._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">
                  {log.fromLocation} → {log.toLocation}
                </h3>
                <p className="text-sm text-gray-600">
                  {log.transportType.replace("-", " ").toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">₹{log.fare}</p>
              </div>
              <button
                onClick={() => handleDeleteLog(log._id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
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
