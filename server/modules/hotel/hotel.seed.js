const Hotel = require("./hotel.model");

const defaultHotels = [
  {
    name: "Ganges View Residency",
    location: "Dashashwamedh Ghat, Varanasi",
    address: "Near Dashashwamedh Ghat, Varanasi, Uttar Pradesh",
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
  {
    name: "Banaras Backpackers Hostel",
    location: "Assi Ghat, Varanasi",
    address: "Assi Ghat Road, Varanasi, Uttar Pradesh",
    category: "hostel",
    pricePerNight: 600,
    contactNumber: "+919123456780",
    websiteUrl: "https://example.com/banaras-backpackers",
    mapUrl: "https://maps.app.goo.gl/MdSPxqFLE9UJK9dc9",
    checkIn: "01:00 PM",
    checkOut: "11:00 AM",
    description: "Budget-friendly hostel popular among solo travellers.",
    amenities: ["Free WiFi", "Shared Kitchen", "Cafe", "Travel Desk"],
    photos: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427"
    ],
    avgRating: 4.6,
  },
  {
    name: "Temple Heritage Stay",
    location: "Godowlia, Varanasi",
    address: "Godowlia Chowk, Varanasi, Uttar Pradesh",
    category: "budget",
    pricePerNight: 1200,
    contactNumber: "+919988776655",
    websiteUrl: "https://example.com/temple-heritage-stay",
    mapUrl: "https://maps.app.goo.gl/MdSPxqFLE9UJK9dc9",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    description: "Affordable rooms close to major attractions.",
    amenities: ["Free WiFi", "Room Service", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
      "https://images.unsplash.com/photo-1455587734955-081b22074882",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
    ],
    avgRating: 4.1,
  },
  {
    name: "Jai kali hostel",
    location: "Lanka, Varanasi",
    address: "Lanka Crossing, Varanasi, Uttar Pradesh",
    category: "hostel",
    pricePerNight: 600,
    contactNumber: "+919988776655",
    websiteUrl: "https://example.com/jai-kali-hostel",
    mapUrl: "https://maps.app.goo.gl/MdSPxqFLE9UJK9dc9",
    checkIn: "01:00 PM",
    checkOut: "11:00 AM",
    description: "Affordable rooms close to major attractions.",
    amenities: ["Free WiFi", "Room Service", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    ],
    avgRating: 4.1,
  },
  {
    name: "mahakal griha",
    location: "Madhyamgram, Varanasi",
    address: "Madhyamgram Extension, Varanasi, Uttar Pradesh",
    category: "luxury",
    pricePerNight: 3200,
    contactNumber: "+919988776655",
    websiteUrl: "https://example.com/mahakal-griha",
    mapUrl: "https://maps.app.goo.gl/MdSPxqFLE9UJK9dc9",
    checkIn: "12:00 PM",
    checkOut: "11:00 AM",
    description: "Affordable rooms close to major attractions.",
    amenities: ["Free WiFi", "Room Service", "Parking"],
    photos: [
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb210b9"
    ],
    avgRating: 4.1,
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
