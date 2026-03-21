import React from "react";
import { Link, useParams } from "react-router-dom";
import { getHotelById } from "../services/hotel.service";
import fallbackHotels from "../DB/hotelDB.json";

function normalizeFallbackHotel(hotel) {
  return {
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    address: hotel.address,
    category: hotel.category,
    pricePerNight: hotel.pricePerNight,
    rating: hotel.rating ?? 0,
    amenities: hotel.amenities ?? [],
    description: hotel.description || "No description available.",
    contactNumber: hotel.phone,
    websiteUrl: hotel.websiteUrl || "",
    mapUrl: hotel.mapUrl || "",
    checkIn: hotel.checkIn || "",
    checkOut: hotel.checkOut || "",
    photos: hotel.images?.gallery?.length
      ? [hotel.images.cover, ...hotel.images.gallery]
      : [hotel.images?.cover].filter(Boolean),
  };
}

function normalizeApiHotel(hotel) {
  return {
    id: hotel._id,
    name: hotel.name,
    location: hotel.location,
    address: hotel.address,
    category: hotel.category,
    pricePerNight: hotel.pricePerNight,
    rating: hotel.avgRating ?? 0,
    amenities: hotel.amenities ?? [],
    description: hotel.description || "No description available.",
    contactNumber: hotel.contactNumber,
    websiteUrl: hotel.websiteUrl || "",
    mapUrl: hotel.mapUrl || "",
    checkIn: hotel.checkIn || "",
    checkOut: hotel.checkOut || "",
    photos: hotel.photos?.length
      ? hotel.photos
      : ["https://via.placeholder.com/1200x700?text=Hotel"],
  };
}

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchHotel() {
      setLoading(true);
      try {
        const apiHotel = await getHotelById(id);
        if (apiHotel) {
          setHotel(normalizeApiHotel(apiHotel));
          return;
        }
      } catch {
        // Continue to fallback source.
      }

      const fallback = fallbackHotels.find((item) => item.id === id);
      if (fallback) {
        setHotel(normalizeFallbackHotel(fallback));
      } else {
        setHotel(null);
      }
      setLoading(false);
    }

    fetchHotel().finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="min-h-screen px-4 py-24">
        <div className="container mx-auto">Loading hotel details...</div>
      </section>
    );
  }

  if (!hotel) {
    return (
      <section className="min-h-screen px-4 py-24">
        <div className="container mx-auto space-y-4">
          <p className="text-lg font-semibold">Hotel not found.</p>
          <Link to="/hotels" className="text-orange-600 hover:underline">
            Back to hotels
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-orange-100/20 min-h-screen py-14">
      <div className="container mx-auto px-4 space-y-8">
        <Link to="/hotels" className="text-orange-600 hover:underline relative z-9990">
          {"<- Back to all hotels"}
        </Link>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
          <img
            src={hotel.photos[0]}
            alt={hotel.name}
            className="w-full h-[360px] object-cover"
          />
          <div className="p-6 md:p-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-red-900">{hotel.name}</h1>
                <p className="text-gray-600 mt-1">{hotel.address || hotel.location}</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold">₹{hotel.pricePerNight}</p>
                <p className="text-xs text-gray-500">per night</p>
              </div>
            </div>

            <p className="text-gray-700">{hotel.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><span className="font-semibold">Category:</span> {hotel.category}</p>
              <p><span className="font-semibold">Rating:</span> {hotel.rating}</p>
              <p><span className="font-semibold">Check-in:</span> {hotel.checkIn || "N/A"}</p>
              <p><span className="font-semibold">Check-out:</span> {hotel.checkOut || "N/A"}</p>
              <p><span className="font-semibold">Contact:</span> {hotel.contactNumber || "N/A"}</p>
              <p className="truncate">
                <span className="font-semibold">Website:</span>{" "}
                {hotel.websiteUrl ? (
                  <a href={hotel.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    {hotel.websiteUrl}
                  </a>
                ) : "N/A"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((item) => (
                <span key={item} className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs">
                  {item}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              {hotel.mapUrl ? (
                <a
                  href={hotel.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  Open Location
                </a>
              ) : null}
              {hotel.contactNumber ? (
                <a
                  href={`tel:${hotel.contactNumber}`}
                  className="px-4 py-2 rounded-full bg-red-800 text-white hover:bg-red-900"
                >
                  Call Hotel
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotel.photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt={`${hotel.name} ${index + 1}`}
                className="h-56 w-full object-cover rounded-xl border border-orange-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelDetails;
