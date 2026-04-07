import React from "react";
import toast from "react-hot-toast";
import { Heart, ArrowLeftCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getHotelById } from "../../services/hotel.service";
import {
  addFavourite,
  checkIsFavourited,
  removeFavourite,
} from "../../services/favourite.service";
import fallbackHotels from "../../DB/hotelDB.json";

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
  const { id, hotel_id: hotelIdParam } = useParams();
  const hotelIdentifier = id || hotelIdParam;
  const navigate = useNavigate();
  const [hotel, setHotel] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isFavourited, setIsFavourited] = React.useState(false);
  const [checkingFavourite, setCheckingFavourite] = React.useState(false);
  const [favouriteBusy, setFavouriteBusy] = React.useState(false);
  const [hasToken, setHasToken] = React.useState(
    Boolean(localStorage.getItem("token")),
  );

  const isMongoObjectId = React.useCallback(
    (value) => /^[a-f\d]{24}$/i.test(String(value || "")),
    [],
  );

  React.useEffect(() => {
    async function fetchHotel() {
      setLoading(true);
      try {
        const apiHotel = await getHotelById(hotelIdentifier);
        if (apiHotel) {
          setHotel(normalizeApiHotel(apiHotel));
          return;
        }
      } catch {
        // Continue to fallback source.
      }

      const fallback = fallbackHotels.find(
        (item) => item.id === hotelIdentifier,
      );
      if (fallback) {
        setHotel(normalizeFallbackHotel(fallback));
      } else {
        setHotel(null);
      }
      setLoading(false);
    }

    fetchHotel().finally(() => setLoading(false));
  }, [hotelIdentifier]);

  React.useEffect(() => {
    const syncAuthState = () => {
      setHasToken(Boolean(localStorage.getItem("token")));
    };

    window.addEventListener("storage", syncAuthState);
    window.addEventListener("dhoom-auth-changed", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("dhoom-auth-changed", syncAuthState);
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchFavouriteStatus() {
      if (!hasToken || !isMongoObjectId(hotel?.id)) {
        setIsFavourited(false);
        return;
      }

      try {
        setCheckingFavourite(true);
        const response = await checkIsFavourited(hotel.id);

        if (!cancelled) {
          setIsFavourited(Boolean(response?.data?.isFavourited));
        }
      } catch {
        if (!cancelled) {
          setIsFavourited(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingFavourite(false);
        }
      }
    }

    if (hotel?.id) {
      fetchFavouriteStatus();
    }

    return () => {
      cancelled = true;
    };
  }, [hotel?.id, hasToken, isMongoObjectId]);

  const handleToggleFavourite = async () => {
    if (!hasToken) {
      toast.error("Please login to mark favourites.");
      navigate("/login", { state: { from: `/hotels/${hotelIdentifier}` } });
      return;
    }

    if (!isMongoObjectId(hotel?.id)) {
      toast.error("This hotel cannot be added to favourites right now.");
      return;
    }

    try {
      setFavouriteBusy(true);

      if (isFavourited) {
        await removeFavourite(hotel.id);
        setIsFavourited(false);
        toast.success("Removed from favourites");
      } else {
        await addFavourite(hotel.id);
        setIsFavourited(true);
        toast.success("Added to favourites");
      }
    } catch (error) {
      toast.error(error?.message || "Unable to update favourites");
    } finally {
      setFavouriteBusy(false);
    }
  };

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
        <Link
          to="/hotels"
          className="text-orange-600 mt-5 flex mb-2 items-center gap-1 ml-3 hover:underline relative z-9990"
        >
          <ArrowLeftCircle />
          {"Back to all hotels"}
        </Link>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-orange-100">
          <img
            src={hotel.photos[0]}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-90 object-cover"
          />
          <div className="p-6 md:p-8 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-red-900">
                  {hotel.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {hotel.address || hotel.location}
                </p>
                <p className="text-gray-600 mt-1">
                  Entity ID:{" "}
                  <code className="text-lg text-red-800 text-semibold">
                    {hotel.id}
                  </code>
                  , This will help you to file report on this hotel, from
                  dashboard
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                <p className="text-2xl font-bold">₹{hotel.pricePerNight}</p>
                <p className="text-xs text-gray-500">per night</p>
              </div>
            </div>

            <p className="text-gray-700">{hotel.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {hotel.category}
              </p>
              <p>
                <span className="font-semibold">Rating:</span> {hotel.rating}
              </p>
              <p>
                <span className="font-semibold">Check-in:</span>{" "}
                {hotel.checkIn || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Check-out:</span>{" "}
                {hotel.checkOut || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {hotel.contactNumber || "N/A"}
              </p>
              <p className="truncate">
                <span className="font-semibold">Website:</span>{" "}
                {hotel.websiteUrl ? (
                  <a
                    href={hotel.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {hotel.websiteUrl}
                  </a>
                ) : (
                  "N/A"
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleToggleFavourite}
                disabled={favouriteBusy || checkingFavourite}
                className={`px-4 py-2 rounded-full text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  isFavourited
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-slate-800 hover:bg-slate-900"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Heart
                    size={16}
                    fill={isFavourited ? "currentColor" : "none"}
                    className="shrink-0"
                  />
                  {checkingFavourite
                    ? "Checking..."
                    : favouriteBusy
                      ? "Updating..."
                      : !hasToken
                        ? "Login to Favourite"
                        : isFavourited
                          ? "Remove Favourite"
                          : "Add to Favourite"}
                </span>
              </button>
              {!hasToken ? (
                <p className="self-center text-xs text-slate-600">
                  Login required to save this hotel in favourites.
                </p>
              ) : null}
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
