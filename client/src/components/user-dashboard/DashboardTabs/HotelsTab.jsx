import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Star, Heart, MapPin, Phone } from "lucide-react";
import {
  getMyFavourites,
  removeFavourite,
} from "../../../services/favourite.service";

export function HotelsTab() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchFavourites = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMyFavourites(page, 10);
      setHotels(result.data?.favourites || []);
      setPagination(result.data?.pagination);
    } catch (error) {
      toast.error("Failed to load favorite hotels");
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const handleRemoveFavourite = async (hotelId) => {
    try {
      await removeFavourite(hotelId);
      toast.success("Removed from favorites");
      setHotels(hotels.filter((h) => h.hotelId._id !== hotelId));
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading favorite hotels...</div>;
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No favorite hotels yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Start adding hotels to your favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hotels.map((fav) => {
          const hotel = fav.hotelId;
          return (
            <div
              key={hotel._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {hotel.images && hotel.images[0] && (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{hotel.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{hotel.location}</span>
                  </div>
                  {hotel.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.rating && (
                    <div className="flex items-center gap-2">
                      <Star
                        size={16}
                        className="text-yellow-500"
                        fill="currentColor"
                      />
                      <span>{hotel.rating}/5</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFavourite(hotel._id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-md transition"
                >
                  <Heart size={16} fill="currentColor" /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
