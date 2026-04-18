import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BusFront, Search, ShieldAlert, IndianRupee } from "lucide-react";
import {
  getTransportPrices,
  getTransportTypes,
  reportTransportIssue,
} from "../services/transport.service";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const defaultFilters = {
  source: "",
  destination: "",
  transportType: "",
};

const Transport = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [transportTypes, setTransportTypes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportingKey, setReportingKey] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const activeFilterCount = useMemo(
    () =>
      Number(Boolean(appliedFilters.source)) +
      Number(Boolean(appliedFilters.destination)) +
      Number(Boolean(appliedFilters.transportType)),
    [appliedFilters],
  );

  const fetchPrices = useCallback(async (nextPage = 1, nextFilters = appliedFilters) => {
    try {
      setLoading(true);
      const payload = await getTransportPrices({
        ...nextFilters,
        page: nextPage,
        limit: 12,
      });
      setPrices(payload.data?.prices || []);
      setPagination(payload.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.message || "Failed to load transport prices");
      setPrices([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    let mounted = true;

    async function loadTransportTypes() {
      try {
        const payload = await getTransportTypes();
        if (!mounted) return;
        setTransportTypes(payload.data || []);
      } catch {
        if (!mounted) return;
        setTransportTypes([]);
      }
    }

    loadTransportTypes();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchPrices(pagination.page, appliedFilters);
  }, [appliedFilters, pagination.page, fetchPrices]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({
      source: filters.source.trim(),
      destination: filters.destination.trim(),
      transportType: filters.transportType.trim(),
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReport = async (entry) => {
    const chargedPriceInput = window.prompt(
      `Official fare is ${formatCurrency(entry.officialPrice)}.\nEnter charged fare to report overcharge:`,
      String(entry.officialPrice || ""),
    );

    if (chargedPriceInput === null) return;
    const chargedPrice = Number(chargedPriceInput);
    if (!Number.isFinite(chargedPrice) || chargedPrice < 0) {
      toast.error("Please enter a valid charged fare.");
      return;
    }

    const reportKey = `${entry._id}-${chargedPrice}`;
    setReportingKey(reportKey);
    try {
      const payload = await reportTransportIssue({
        transportType: entry.transportTypeName || entry.transportType?.typeName,
        source: entry.source,
        destination: entry.destination,
        chargedPrice,
      });
      toast.success(payload.message || "Report submitted successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to submit report right now.");
    } finally {
      setReportingKey("");
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 pt-24 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 inline-flex items-center gap-2">
            <BusFront className="h-7 w-7 text-orange-600" />
            Public Transport Directory
          </h1>
          <p className="text-slate-600 mt-2">
            Check official fares across routes and report suspicious overcharging.
          </p>
        </div>

        <form
          onSubmit={applyFilters}
          className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              placeholder="Source (e.g., Godowlia)"
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              placeholder="Destination (e.g., Assi Ghat)"
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              name="transportType"
              value={filters.transportType}
              onChange={handleFilterChange}
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All transport types</option>
              {transportTypes.map((type) => (
                <option key={type._id} value={type.typeName}>
                  {titleCase(type.typeName)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 inline-flex items-center justify-center gap-2 font-medium"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-slate-600">
              Active filters: <span className="font-semibold">{activeFilterCount}</span>
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-slate-700 hover:text-slate-900 underline underline-offset-2"
            >
              Reset filters
            </button>
          </div>
        </form>

        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-600">
            Loading transport prices...
          </div>
        ) : prices.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">No fares found</p>
            <p className="text-sm text-slate-600 mt-1">
              Try changing source, destination, or transport type filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prices.map((entry) => (
              <article
                key={entry._id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {entry.source} to {entry.destination}
                    </p>
                    <p className="text-sm text-slate-600 capitalize mt-0.5">
                      {titleCase(entry.transportTypeName)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-semibold">
                    <IndianRupee className="h-3.5 w-3.5" />
                    Official
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Official fare</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(entry.officialPrice)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Distance</p>
                    <p className="font-semibold text-slate-900">
                      {entry.distanceKm ? `${entry.distanceKm} km` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 col-span-2">
                    <p className="text-slate-500 text-xs">Approx travel time</p>
                    <p className="font-semibold text-slate-900">
                      {entry.approxTime || "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleReport(entry)}
                  disabled={reportingKey.startsWith(entry._id)}
                  className="mt-3 w-full rounded-lg bg-slate-900 hover:bg-black text-white px-3 py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldAlert className="h-4 w-4" />
                  {reportingKey.startsWith(entry._id)
                    ? "Submitting report..."
                    : "Report overcharge"}
                </button>
              </article>
            ))}
          </div>
        )}

        {pagination.pages > 1 ? (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page <= 1 || loading}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-sm text-slate-700">
              Page {pagination.page} of {pagination.pages}
            </p>
            <button
              type="button"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.pages, prev.page + 1),
                }))
              }
              disabled={pagination.page >= pagination.pages || loading}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Transport;
