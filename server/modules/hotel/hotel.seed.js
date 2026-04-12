const Hotel = require("./hotel.model");

const defaultHotels = [
  {
    name: "Demo Hotel",
    location: "Dashashwamedh Ghat, Varanasi",
    address: "Near Dashashwamedh Ghat, Varanasi, Uttar Pradesh",
    latitude: 25.3067,
    longitude: 82.9739,
    category: "mid",
    pricePerNight: 2800,
    contactNumber: "+919876543210",
    websiteUrl: "https://example.com/ganges-view-residency",
    mapUrl: "https://maps.app.goo.gl/MdSPxqFLE9UJK9dc9",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    description: "Comfortable stay near the ghat with city access.",
    amenities: ["Free WiFi", "AC Rooms", "Restaurant", "24h Reception"],
    photos: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"
    ],
    avgRating: 4.4,
  },
];

async function seedHotelsIfEmpty() {
  const count = await Hotel.countDocuments();
  if (count > 0) {
    return;
  }

  await Hotel.insertMany(defaultHotels);
  console.log("Seeded default hotel data");
}

module.exports = {
  seedHotelsIfEmpty,
};
