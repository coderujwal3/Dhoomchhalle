export interface Hotel {
  id: string;
  name: string;
  category: "budget" | "mid-range" | "luxury" | "hostel";

  location: string;
  address: string;

  coordinates: {
    latitude: number;
    longitude: number;
  };

  pricePerNight: number;

  rating: number;
  totalReviews: number;

  phone: string;

  amenities: string[];

  distanceFromLandmark: {
    kashiVishwanathTemple: string;
    dashashwamedhGhat: string;
    varanasiJunction: string;
  };

  images: {
    cover: string;
    gallery: string[];
  };

  checkIn: string;
  checkOut: string;
}

export const hotels: Hotel[] = [
  {
    id: "hotel_1",
    name: "Ganges View Residency",
    category: "mid-range",

    location: "Dashashwamedh Ghat",
    address: "Near Dashashwamedh Ghat, Varanasi, Uttar Pradesh",

    coordinates: {
      latitude: 25.3066,
      longitude: 83.0105
    },

    pricePerNight: 2800,

    rating: 4.4,
    totalReviews: 324,

    phone: "+91 9876543210",

    amenities: [
      "Free WiFi",
      "AC Rooms",
      "Restaurant",
      "Ganga View",
      "24h Reception"
    ],

    distanceFromLandmark: {
      kashiVishwanathTemple: "500 m",
      dashashwamedhGhat: "150 m",
      varanasiJunction: "4.5 km"
    },

    images: {
      cover: "/images/hotels/ganges-view.jpg",
      gallery: [
        "/images/hotels/ganges-view-1.jpg",
        "/images/hotels/ganges-view-2.jpg"
      ]
    },

    checkIn: "12:00 PM",
    checkOut: "11:00 AM"
  },

  {
    id: "hotel_2",
    name: "Banaras Backpackers Hostel",
    category: "hostel",

    location: "Assi Ghat",
    address: "Near Assi Ghat, Varanasi, Uttar Pradesh",

    coordinates: {
      latitude: 25.2874,
      longitude: 83.0020
    },

    pricePerNight: 600,

    rating: 4.6,
    totalReviews: 210,

    phone: "+91 9123456780",

    amenities: [
      "Free WiFi",
      "Shared Kitchen",
      "Dorm Beds",
      "Cafe",
      "Travel Desk"
    ],

    distanceFromLandmark: {
      kashiVishwanathTemple: "3 km",
      dashashwamedhGhat: "2.5 km",
      varanasiJunction: "6 km"
    },

    images: {
      cover: "/images/hotels/backpackers.jpg",
      gallery: [
        "/images/hotels/backpackers-1.jpg",
        "/images/hotels/backpackers-2.jpg"
      ]
    },

    checkIn: "1:00 PM",
    checkOut: "11:00 AM"
  },

  {
    id: "hotel_3",
    name: "Hotel Temple Heritage",
    category: "budget",

    location: "Godowlia",
    address: "Godowlia Chowk, Varanasi, Uttar Pradesh",

    coordinates: {
      latitude: 25.3087,
      longitude: 83.0066
    },

    pricePerNight: 1200,

    rating: 4.1,
    totalReviews: 178,

    phone: "+91 9988776655",

    amenities: [
      "Free WiFi",
      "AC Rooms",
      "Room Service",
      "Parking"
    ],

    distanceFromLandmark: {
      kashiVishwanathTemple: "700 m",
      dashashwamedhGhat: "400 m",
      varanasiJunction: "4 km"
    },

    images: {
      cover: "/images/hotels/temple-heritage.jpg",
      gallery: [
        "/images/hotels/temple-heritage-1.jpg",
        "/images/hotels/temple-heritage-2.jpg"
      ]
    },

    checkIn: "12:00 PM",
    checkOut: "11:00 AM"
  }
];