import React from "react";
import HotelCard from "../components/hotels/HotelCard";
import { getHotels } from "../services/hotel.service";
import fallbackHotels from "../DB/hotelDB.json";

const Hotels = () => {
  const [hotels, setHotels] = React.useState(fallbackHotels);

  React.useEffect(() => {
    async function fetchHotels() {
      try {
        const apiHotels = await getHotels();
        if (!Array.isArray(apiHotels) || apiHotels.length === 0) {
          return;
        }

        const normalized = apiHotels.map((hotel) => ({
          id: hotel._id,
          name: hotel.name,
          location: hotel.location,
          address: hotel.address,
          category: hotel.category,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.avgRating ?? 0,
          description: hotel.description,
          amenities: hotel.amenities ?? [],
          mapUrl: hotel.mapUrl || "#",
          contact: hotel.contactNumber,
          websiteUrl: hotel.websiteUrl || "",
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut,
          photos: hotel.photos ?? [],
          images: {
            cover: hotel.photos?.[0] || "https://via.placeholder.com/640x360?text=Hotel",
          },
        }));

        setHotels(normalized);
      } catch {
        // Keep fallback hotels when API is unavailable.
      }
    }

    fetchHotels();
  }, []);

  return <>
    <div className="min-h-screen bg-transparent relative">
        <HotelCard hotels={hotels} />
      </div>
  </>
};

export default Hotels;
