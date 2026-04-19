import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ShieldAlert, IndianRupee } from "lucide-react";
import { getMyFareChecks } from "../../../services/fareCheck.service";

const riskClasses = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function FareChecksTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [riskLevel, setRiskLevel] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await getMyFareChecks({
        page,
        limit: 8,
        riskLevel: riskLevel || undefined,
      });
      setRecords(payload.data?.records || []);
      setPagination(payload.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.message || "Failed to load fare check history");
      setRecords([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, riskLevel]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return <div className="text-center py-8">Loading fare checks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 inline-flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
            Fare Trust History
          </h3>
          <p className="text-sm text-slate-600">
            Your recent fare checks and overcharge alerts.
          </p>
        </div>
        <select
          value={riskLevel}
          onChange={(event) => {
            setRiskLevel(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All risk levels</option>
          <option value="high">High risk</option>
          <option value="medium">Medium risk</option>
          <option value="low">Low risk</option>
        </select>
      </div>

      {!records.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600">
          No fare-check history yet. Use Fare Check to start building your trust data.
        </div>
      ) : (
        records.map((record) => (
          <article
            key={record._id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{record.routeLabel}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {record.transportType.replace("-", " ")} |{" "}
                  {new Date(record.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  riskClasses[record.riskLevel] || riskClasses.low
                }`}
              >
                {record.riskLevel} risk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-slate-500 text-xs">Quoted Fare</p>
                <p className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {formatCurrency(record.quotedFare)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-slate-500 text-xs">Expected Max</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(record.expectedFareMax)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5">
                <p className="text-slate-500 text-xs">Overcharge %</p>
                <p className="font-semibold text-slate-900">
                  {Number(record.overchargePercent || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </article>
        ))
      )}

      {pagination.pages > 1 ? (
        <div className="flex justify-center items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-md border border-slate-300 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-sm text-slate-700">
            Page {page} of {pagination.pages}
          </p>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
            disabled={page === pagination.pages}
            className="px-3 py-2 rounded-md border border-slate-300 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
