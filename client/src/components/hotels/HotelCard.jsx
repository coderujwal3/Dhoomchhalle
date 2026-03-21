import React from "react";
import {motion} from "framer-motion";
import { Link } from "react-router-dom";
import {
  StarIcon,
  CornerDownRightIcon,
  MapPinIcon,
  PhoneCallIcon,
} from "lucide-react";

const HotelCard = ({ hotels = [] }) => {
  return (
    <section className="py-20 md:py-28 bg-orange-100/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 left-[50%] translate-x-[-50%] w-82 h-32 rounded-full bg-linear-to-r from-orange-500/50 to-orange-200/50 blur-[60px]" />
      <div className="absolute bottom-40 right-20 w-72 h-72 rounded-full bg-linear-to-r from-orange-200/50 to-orange-500/70 blur-[80px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm tracking-[0.2em] uppercase text-amber-500 mb-2 font-bold">
            Stay
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Featured Hotels
          </h2>
          <div className="w-20 h-1 bg-orange-500/80 rounded-full mx-auto mb-4" />
          <p className="font-sans text-gray-500 max-w-xl mx-auto">
            Experience the best hospitality in Varanasi with our curated list of
            comfortable and luxurious stays.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, i) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_10px_30px_rgba(245,158,11,0.15)] transition-all duration-300 border border-orange-100/50 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-60 overflow-hidden">
                <motion.img
                  src={hotel.images.cover}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                  loading="lazy"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <StarIcon
                    size={14}
                    fill="currentColor"
                    className="text-orange-500"
                  />
                  <span className="font-bold text-sm text-gray-800">
                    {hotel.rating}
                  </span>
                </div>
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col grow">
                <h3 className="font-display text-2xl font-bold text-red-800 mb-3 line-clamp-1">
                  {hotel.name}
                </h3>

                <div className="flex items-start gap-2 mb-4 text-gray-600">
                  <MapPinIcon
                    size={18}
                    className="shrink-0 mt-0.5 text-orange-500"
                  />
                  <p className="font-sans text-sm line-clamp-2">
                    {hotel.location}
                  </p>
                </div>

                <div className="mb-5 bg-orange-50/50 p-3 rounded-lg border border-orange-100 inline-block self-start">
                  <p className="text-xl font-bold text-gray-900">
                    ₹{hotel.pricePerNight}
                    <span className="text-sm font-normal text-gray-500">
                      {" "}
                      / night
                    </span>
                  </p>
                </div>

                {/* Amenities */}
                <div className="mb-6 space-y-2.5 grow">
                  {hotel.amenities?.slice(0, 3).map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 text-sm text-gray-700"
                    >
                      <CornerDownRightIcon
                        size={16}
                        className="text-orange-400 shrink-0"
                      />
                      <p className="line-clamp-1">{amenity}</p>
                    </div>
                  ))}
                  {hotel.amenities?.length > 3 && (
                    <p className="text-xs text-orange-600 font-medium pl-6">
                      +{hotel.amenities.length - 3} more amenities
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-5 border-t border-orange-100">
                  <Link to={`/hotels/${hotel.id}`} className="w-full sm:flex-1">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-medium transition-colors shadow-md"
                    >
                      View Details
                    </motion.button>
                  </Link>
                  <a
                    href={hotel.mapUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shadow-md shadow-orange-500/20"
                    >
                      <MapPinIcon size={16} />
                      Location
                    </motion.button>
                  </a>

                  <a
                    href={`tel:${hotel.contact || "+918528938966"}`}
                    className="w-full sm:flex-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-red-800 hover:bg-red-900 text-white text-sm font-medium transition-colors shadow-md shadow-red-800/20"
                    >
                      <PhoneCallIcon size={16} />
                      Contact
                    </motion.button>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelCard;