import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Clock3, Search, TrainFront } from "lucide-react";
import { getTimings } from "../services/timing.service";

function titleCase(value) {
  return String(value || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const defaultFilters = {
  transportType: "",
  routeName: "",
  stationName: "",
};

const Timings = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const activeFilterCount = useMemo(
    () =>
      Number(Boolean(appliedFilters.transportType)) +
      Number(Boolean(appliedFilters.routeName)) +
      Number(Boolean(appliedFilters.stationName)),
    [appliedFilters],
  );

  const fetchTimings = useCallback(async (nextPage = 1, nextFilters = appliedFilters) => {
    try {
      setLoading(true);
      const payload = await getTimings({
        ...nextFilters,
        page: nextPage,
        limit: 12,
      });
      setTimings(payload.data?.timings || []);
      setPagination(payload.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.message || "Failed to load timings");
      setTimings([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchTimings(pagination.page, appliedFilters);
  }, [appliedFilters, pagination.page, fetchTimings]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters({
      transportType: filters.transportType.trim(),
      routeName: filters.routeName.trim(),
      stationName: filters.stationName.trim(),
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <section className="min-h-screen bg-slate-50 pt-24 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 inline-flex items-center gap-2">
            <Clock3 className="h-7 w-7 text-orange-600" />
            Transport Timings
          </h1>
          <p className="text-slate-600 mt-2">
            Explore departures and arrivals for buses, trains, and city rides.
          </p>
        </div>

        <form
          onSubmit={applyFilters}
          className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 md:p-5 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              name="transportType"
              value={filters.transportType}
              onChange={handleFilterChange}
              placeholder="Transport type (e.g., bus-ac)"
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              name="routeName"
              value={filters.routeName}
              onChange={handleFilterChange}
              placeholder="Route name"
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              name="stationName"
              value={filters.stationName}
              onChange={handleFilterChange}
              placeholder="Station / stop name"
              className="rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
            Loading timing data...
          </div>
        ) : timings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">No timings found</p>
            <p className="text-sm text-slate-600 mt-1">
              Try changing filters for transport type, route, or station.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timings.map((timing) => (
              <article
                key={timing._id}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {timing.routeName || "Route"}
                    </p>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {titleCase(timing.transportType)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-800 px-3 py-1 text-xs font-semibold">
                    <TrainFront className="h-3.5 w-3.5" />
                    Schedule
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Departure</p>
                    <p className="font-semibold text-slate-900">
                      {timing.departureTime || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Arrival</p>
                    <p className="font-semibold text-slate-900">
                      {timing.arrivalTime || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Frequency</p>
                    <p className="font-semibold text-slate-900">
                      {timing.frequency || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-slate-500 text-xs">Station</p>
                    <p className="font-semibold text-slate-900">
                      {timing.stationName || "N/A"}
                    </p>
                  </div>
                </div>
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

export default Timings;
