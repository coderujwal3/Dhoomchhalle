import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Hotel,
  MapPin,
  Star,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Eye,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../services/api/adminAPI";
import { getSession } from "../services/auth.service";

const HOTELS_PER_PAGE = 10;
const FETCH_BATCH_SIZE = 100;

const CATEGORY_COLORS = {
  budget: "bg-emerald-600 text-white",
  mid: "bg-blue-600 text-white",
  luxury: "bg-purple-600 text-white",
  hostel: "bg-amber-600 text-white",
};

const CATEGORY_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Budget", value: "budget" },
  { label: "Mid", value: "mid" },
  { label: "Luxury", value: "luxury" },
  { label: "Hostel", value: "hostel" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const AdminHotels = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadSeed, setReloadSeed] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingHotelId, setDeletingHotelId] = useState("");
  const [hotelPendingDelete, setHotelPendingDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const session = await getSession();
        if (!cancelled) {
          setIsAdmin(session?.data?.user?.role === "admin");
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(async () => {
      try {
        const allHotels = [];
        let page = 1;
        let totalPages = 1;

        do {
          const response = await adminAPI.getAllHotels(
            page,
            FETCH_BATCH_SIZE,
            null,
            "",
          );

          if (cancelled) return;

          const hotelsData = response?.data?.data?.hotels || [];
          const pagination = response?.data?.data?.pagination || {};

          totalPages = Math.max(1, Number(pagination.pages) || 1);
          allHotels.push(...hotelsData);
          page += 1;
        } while (page <= totalPages);

        setHotels(allHotels);
      } catch (error) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || "Failed to fetch hotels");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [reloadSeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setReloadSeed((value) => value + 1);
  };

  const handleViewHotel = async (hotelId) => {
    try {
      setSelectedHotel({});
      setDetailsLoading(true);
      const response = await adminAPI.getHotelDetails(hotelId);
      setSelectedHotel(response?.data?.data || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch hotel details");
      setSelectedHotel(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteHotel = (hotel) => {
    if (!isAdmin) return;

    const hotelId = hotel?._id || hotel?.id;
    if (!hotelId) return;

    setHotelPendingDelete(hotel);
  };

  const confirmDeleteHotel = async () => {
    if (!hotelPendingDelete || !isAdmin) return;

    const hotelId = hotelPendingDelete?._id || hotelPendingDelete?.id;
    if (!hotelId) return;

    try {
      setDeletingHotelId(hotelId);
      await adminAPI.deleteHotel(hotelId);
      setHotels((previousHotels) =>
        previousHotels.filter((item) => (item._id || item.id) !== hotelId),
      );

      if ((selectedHotel?._id || selectedHotel?.id) === hotelId) {
        setSelectedHotel(null);
      }

      toast.success("Hotel deleted successfully");
      setHotelPendingDelete(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete hotel");
    } finally {
      setDeletingHotelId("");
    }
  };

  const filteredHotels = useMemo(() => {
    const query = search.toLowerCase().trim();

    return hotels.filter((hotel) => {
      const matchCategory = filter === "All" || hotel.category === filter;
      const matchSearch = (hotel.name || "").toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }, [hotels, filter, search]);

  const totalHotels = filteredHotels.length;
  const totalPages = Math.max(1, Math.ceil(totalHotels / HOTELS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedHotels = useMemo(() => {
    const startIndex = (currentPage - 1) * HOTELS_PER_PAGE;
    return filteredHotels.slice(startIndex, startIndex + HOTELS_PER_PAGE);
  }, [filteredHotels, currentPage]);

  const metrics = useMemo(() => {
    if (!filteredHotels.length) {
      return {
        avgPrice: 0,
        avgRating: 0,
        topCategory: "N/A",
      };
    }

    const totalPrice = filteredHotels.reduce(
      (sum, hotel) => sum + (Number(hotel.pricePerNight) || 0),
      0,
    );

    const totalRating = filteredHotels.reduce(
      (sum, hotel) => sum + (Number(hotel.avgRating) || 0),
      0,
    );

    const categoryCount = filteredHotels.reduce((acc, hotel) => {
      const category = hotel.category || "unknown";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    let topCategory = "N/A";
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    });

    return {
      avgPrice: Math.round(totalPrice / filteredHotels.length),
      avgRating: (totalRating / filteredHotels.length).toFixed(1),
      topCategory,
    };
  }, [filteredHotels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-linear-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Hotels Management</h1>
        <p className="text-slate-400">
          Browse hotels, monitor listing quality, and inspect detailed records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-5 ring-1 ring-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">Total Hotels</p>
            <Hotel className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{totalHotels}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-5 ring-1 ring-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">Avg Price/Night</p>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {formatCurrency(metrics.avgPrice)}
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-5 ring-1 ring-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">Avg Rating</p>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{metrics.avgRating}</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-5 ring-1 ring-slate-600">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 text-sm">Top Category</p>
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2 capitalize">
            {metrics.topCategory}
          </p>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-5 mb-6 ring-1 ring-slate-600">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search hotels..."
              className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-600 text-slate-200 hover:bg-slate-500"
                }`}
              >
                {option.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleRefresh}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition flex items-center justify-center"
              title="Refresh"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg overflow-hidden ring-1 ring-slate-600">
        {paginatedHotels.length === 0 ? (
          <div className="p-12 text-center">
            <Hotel className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 text-lg font-semibold mb-1">
              No hotels found
            </p>
            <p className="text-slate-400 text-sm">
              Try updating your search or category filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-245">
                <thead className="bg-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Hotel
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Price / Night
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Added On
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-600">
                  {paginatedHotels.map((hotel) => (
                    <tr key={hotel._id} className="hover:bg-slate-600 transition">
                      <td className="px-6 py-4 align-top">
                        <p className="text-white font-semibold">{hotel.name}</p>
                        <p className="text-slate-300 text-sm mt-1 line-clamp-1">
                          {hotel.address || "No address provided"}
                        </p>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold capitalize ${
                            CATEGORY_COLORS[hotel.category] ||
                            "bg-slate-500 text-white"
                          }`}
                        >
                          {hotel.category || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top text-sm text-slate-200">
                        {hotel.location || "-"}
                      </td>

                      <td className="px-6 py-4 align-top text-sm text-slate-200 font-semibold">
                        {formatCurrency(hotel.pricePerNight)}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-yellow-600 text-white text-xs font-semibold">
                          <Star className="w-3.5 h-3.5" />
                          {Number(hotel.avgRating || 0).toFixed(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top text-sm text-slate-300">
                        {formatDate(hotel.createdAt)}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewHotel(hotel._id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteHotel(hotel)}
                              disabled={deletingHotelId === (hotel._id || hotel.id)}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400/60 text-white rounded text-xs font-semibold transition disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingHotelId === (hotel._id || hotel.id)
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-slate-600 border-t border-slate-500">
              <p className="text-sm text-slate-300">
                Page <span className="font-semibold text-white">{currentPage}</span>{" "}
                of <span className="font-semibold text-white">{totalPages}</span>
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
        )}
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-800 rounded-xl ring-1 ring-slate-600 overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">Hotel Details</h3>
              <button
                type="button"
                onClick={() => setSelectedHotel(null)}
                className="text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-white text-xl font-bold mb-1">
                    {selectedHotel.name}
                  </p>
                  <p className="text-slate-300 text-sm">
                    {selectedHotel.location || "Location unavailable"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-white capitalize">
                      {selectedHotel.category || "-"}
                    </p>
                  </div>

                  <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                      Price / Night
                    </p>
                    <p className="text-white">
                      {formatCurrency(selectedHotel.pricePerNight)}
                    </p>
                  </div>

                  <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                      Average Rating
                    </p>
                    <p className="text-white">
                      {Number(selectedHotel.avgRating || 0).toFixed(1)} / 5
                    </p>
                  </div>

                  <div className="bg-slate-700 rounded p-4">
                    <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                      Contact Number
                    </p>
                    <p className="text-white">{selectedHotel.contactNumber || "-"}</p>
                  </div>
                </div>

                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                    Address
                  </p>
                  <p className="text-slate-200">
                    {selectedHotel.address || "No address available."}
                  </p>
                </div>

                <div className="bg-slate-700 rounded p-4">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedHotel.amenities || []).length > 0 ? (
                      selectedHotel.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 rounded-full bg-slate-600 text-slate-100 text-xs"
                        >
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-300 text-sm">
                        No amenities listed.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {hotelPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-800 ring-1 ring-slate-600 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-600 bg-slate-700 flex items-start gap-3">
              <div className="rounded-full bg-rose-100 p-2 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <h3 className="text-white text-lg font-semibold">Delete Hotel</h3>
                <p className="text-slate-300 text-sm mt-1">
                  You are about to delete{" "}
                  <span className="font-semibold text-white">
                    {hotelPendingDelete.name || "this hotel"}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-800 space-y-2">
              <p className="text-slate-300 text-sm">
                All related favourite and review records linked to this hotel will
                also be removed.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHotelPendingDelete(null)}
                  disabled={deletingHotelId === (hotelPendingDelete._id || hotelPendingDelete.id)}
                  className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteHotel}
                  disabled={deletingHotelId === (hotelPendingDelete._id || hotelPendingDelete.id)}
                  className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition disabled:bg-rose-400/60 disabled:cursor-not-allowed"
                >
                  {deletingHotelId === (hotelPendingDelete._id || hotelPendingDelete.id)
                    ? "Deleting..."
                    : "Delete Hotel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
        navigate("/admin/addhotelform");
      }}
        className="mt-3 mb-3 w-full text-xl p-4 bg-red-400 text-white border-none rounded-md cursor-pointer"
        type="button"
      >
        Add Hotel
      </button>
    </div>
  );
};

export default AdminHotels;
