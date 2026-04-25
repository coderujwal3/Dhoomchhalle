const mongoose = require("mongoose");
const Hotel = require("../../hotel/hotel.model");
const Place = require("../../map/place.model");
const {
  calculateFare,
  computeAndRankRoute,
  getPlacesWithinBounds,
  getTransports,
} = require("../../map/map.service");

const VARANASI_CENTER = { lat: 25.3176, lng: 82.9739 };
const SOURCE_PATHS = {
  hotels: "/hotels",
  map: "/route-planner",
  food: "/#food",
  places: "/#places",
  safety: "/safety",
};

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function source(label, href, type = "internal") {
  return { label, href, type };
}

function formatMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Free";
  return `INR ${Math.round(amount)}`;
}

function formatDistanceFromMeters(distanceMeters) {
  const km = Number(distanceMeters || 0) / 1000;
  return `${km.toFixed(2)} km`;
}

function formatDurationFromSeconds(durationSeconds) {
  const totalMinutes = Math.round(Number(durationSeconds || 0) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
}

function distanceKm(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const lat1 = Number(a.lat);
  const lon1 = Number(a.lng);
  const lat2 = Number(b.lat);
  const lon2 = Number(b.lng);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) {
    return Number.POSITIVE_INFINITY;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return normalizeText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTransportName(value) {
  return normalizeText(value).toLowerCase();
}

function isWalkingTransport(name) {
  return /\b(walk|walking|foot|pedestrian)\b/i.test(name);
}

function maxReasonableDistanceKm(transportName) {
  const name = normalizeTransportName(transportName);
  if (isWalkingTransport(name)) return 1.5;
  if (name.includes("e-rickshaw")) return 8;
  if (name.includes("rickshaw")) return 10;
  if (name.includes("auto")) return 18;
  if (name.includes("bike")) return 25;
  return Number.POSITIVE_INFINITY;
}

function getEstimatedDurationSeconds({ transport, distanceKm, routeDurationSeconds }) {
  const speed = Number(transport.averageSpeedKmph || 0);
  if (Number.isFinite(speed) && speed > 0) {
    return Math.round((distanceKm / speed) * 3600);
  }
  return Number(routeDurationSeconds || 0);
}

function selectPracticalTransport({ fareOptions, distanceKm }) {
  const viableOptions = fareOptions.filter((option) => {
    const maxDistance = maxReasonableDistanceKm(option.transport);
    return distanceKm <= maxDistance;
  });

  const candidates = viableOptions.length
    ? viableOptions
    : fareOptions.filter((option) => !isWalkingTransport(option.transport));

  return [...(candidates.length ? candidates : fareOptions)].sort(
    (a, b) => a.practicalScore - b.practicalScore
  )[0];
}

function extractRoute(message) {
  const text = normalizeText(message);
  const fromTo = text.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:\?|$|,| for | by )/i);
  if (fromTo) {
    return {
      source: fromTo[1].trim(),
      destination: fromTo[2].trim(),
    };
  }

  const destination = text.match(
    /\b(?:to|destination|go to|route to|take me to)\s+(.+?)(?:\?|$|,| by | via )/i
  );
  if (destination) {
    return { destination: destination[1].trim() };
  }

  return {};
}

function resolveHotelPrefs(message, memory) {
  const msg = normalizeText(message);
  const typeMatch = msg.match(/\b(hostel|dorm|luxury|premium|budget|mid|standard|guest house|lodge|lounge|launge)\b/i);
  const budgetMatch = msg.match(
    /\b(?:budget|under|below|around|upto|up to|max|maximum)\s*(?:inr|rs\.?|₹)?\s*(\d{3,6})\b/i
  );
  const locationMatch = msg.match(
    /\b(?:near|around|in|at|location)\s+([a-zA-Z\s]+?)(?:\s+(?:hotel|hostel|room|stay|under|below|budget|luxury|mid|standard|please)|[?.!,]|$)/i
  );

  let hotelType = memory.hotelType || "";
  if (typeMatch) {
    const rawType = typeMatch[1].toLowerCase();
    hotelType = rawType.includes("hostel") || rawType.includes("dorm")
      ? "hostel"
      : rawType.includes("luxury") || rawType.includes("premium")
        ? "luxury"
        : rawType.includes("budget")
          ? "budget"
          : "mid";
  }

  return {
    budget: budgetMatch ? Number(budgetMatch[1]) : memory.hotelBudget || null,
    location: locationMatch ? locationMatch[1].trim() : memory.preferredLocation || "",
    type: hotelType,
  };
}

function toHotelCard(hotel, extra = {}) {
  return {
    id: String(hotel._id || hotel.id),
    name: hotel.name,
    price: formatMoney(hotel.pricePerNight),
    pricePerNight: Number(hotel.pricePerNight || 0),
    rating: hotel.avgRating ? String(hotel.avgRating) : "New",
    avgRating: Number(hotel.avgRating || 0),
    category: hotel.category,
    location: hotel.location,
    address: hotel.address || "",
    amenities: hotel.amenities || [],
    photos: hotel.photos || [],
    mapUrl: hotel.mapUrl || "",
    latitude: Number(hotel.latitude),
    longitude: Number(hotel.longitude),
    reason: extra.reason || "",
    distanceKm: Number.isFinite(extra.distanceKm)
      ? Number(extra.distanceKm.toFixed(2))
      : null,
    rankLabel: extra.rankLabel || "",
  };
}

async function geocodePlace(name) {
  if (!isDbReady()) return null;
  const safeName = normalizeText(name);
  if (!safeName) return null;

  const pattern = new RegExp(escapeRegex(safeName), "i");
  const [place, hotel] = await Promise.all([
    Place.findOne({ name: pattern })
      .select("name location type details price")
      .lean()
      .exec(),
    Hotel.findOne({
      $and: [
        { name: { $not: /^demo hotel$/i } },
        { $or: [{ name: pattern }, { location: pattern }, { address: pattern }] },
      ],
    })
      .select("name location address latitude longitude category pricePerNight")
      .lean()
      .exec(),
  ]);

  if (place?.location?.coordinates?.length === 2) {
    return {
      name: place.name,
      type: place.type,
      details: place.details || "",
      price: place.price,
      lat: Number(place.location.coordinates[1]),
      lng: Number(place.location.coordinates[0]),
    };
  }

  if (hotel && Number.isFinite(Number(hotel.latitude)) && Number.isFinite(Number(hotel.longitude))) {
    return {
      name: hotel.name,
      type: "hotel",
      details: hotel.address || hotel.location,
      price: hotel.pricePerNight,
      lat: Number(hotel.latitude),
      lng: Number(hotel.longitude),
    };
  }

  return null;
}

async function buildHotelResponse(message, memory) {
  const prefs = resolveHotelPrefs(message, memory);
  const missing = [];
  if (!prefs.budget && memory.budget !== "high") missing.push("your nightly budget");
  if (!prefs.location) missing.push("preferred area or landmark");
  if (!prefs.type) missing.push("hotel type: hostel, budget, mid, or luxury");

  if (missing.length) {
    return {
      response: {
        type: "text",
        reply: `Before I show hotels, tell me ${missing.join(", ")}. Example: "under 2500 near Assi Ghat hostel".`,
        actions: [
          "under 1500 near Assi Ghat hostel",
          "under 3000 near Dashashwamedh Ghat mid",
          "luxury near Nadesar",
        ],
      },
      sources: [source("Hotel records", SOURCE_PATHS.hotels)],
      summary: "Asked the user for missing hotel budget, location, and type before showing hotel records.",
    };
  }

  if (!isDbReady()) {
    return {
      response: {
        type: "text",
        reply: "I can only show saved website hotels after the database is connected. Please try again when the backend DB is online.",
      },
      sources: [source("Hotel records", SOURCE_PATHS.hotels)],
      summary: "Hotel database was unavailable.",
    };
  }

  const query = { name: { $not: /^demo hotel$/i } };
  if (prefs.type && ["budget", "mid", "luxury", "hostel"].includes(prefs.type)) {
    query.category = prefs.type;
  }
  if (prefs.budget) {
    query.pricePerNight = { $lte: Number(prefs.budget) };
  }

  const [hotels, locationPoint] = await Promise.all([
    Hotel.find(query)
      .select("name location address latitude longitude category pricePerNight amenities avgRating photos mapUrl description")
      .sort({ avgRating: -1, pricePerNight: 1 })
      .limit(80)
      .lean()
      .exec(),
    geocodePlace(prefs.location),
  ]);

  if (!hotels.length) {
    return {
      response: {
        type: "text",
        reply: "I could not find saved website hotels matching that budget and type. Try a higher budget or a nearby area.",
      },
      sources: [source("Hotel records", SOURCE_PATHS.hotels)],
      summary: "No matching hotels found in the Hotel collection.",
    };
  }

  const scored = hotels
    .map((hotel) => {
      const hotelPoint = { lat: Number(hotel.latitude), lng: Number(hotel.longitude) };
      const distance = locationPoint ? distanceKm(locationPoint, hotelPoint) : null;
      const ratingScore = Number(hotel.avgRating || 0) * 10;
      const priceScore = prefs.budget
        ? Math.max(0, 20 - Math.abs(Number(hotel.pricePerNight || 0) - prefs.budget) / 250)
        : 0;
      const locationScore = Number.isFinite(distance) ? Math.max(0, 40 - distance * 8) : 0;
      return {
        hotel,
        distance,
        score: ratingScore + priceScore + locationScore,
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const bestPoint = {
    lat: Number(best.hotel.latitude),
    lng: Number(best.hotel.longitude),
  };
  const nearby = scored
    .slice(1)
    .map((item) => ({
      ...item,
      distanceFromBest: distanceKm(bestPoint, {
        lat: Number(item.hotel.latitude),
        lng: Number(item.hotel.longitude),
      }),
    }))
    .sort((a, b) => a.distanceFromBest - b.distanceFromBest)
    .slice(0, 2);

  const cards = [
    toHotelCard(best.hotel, {
      rankLabel: "Best match",
      distanceKm: best.distance,
      reason: `Best fit for ${formatMoney(prefs.budget)} budget, ${prefs.type} type${prefs.location ? ` near ${prefs.location}` : ""}.`,
    }),
    ...nearby.map((item, index) =>
      toHotelCard(item.hotel, {
        rankLabel: `Nearby option ${index + 1}`,
        distanceKm: item.distanceFromBest,
        reason: `Near the best match (${item.distanceFromBest.toFixed(2)} km away).`,
      })
    ),
  ];

  return {
    response: {
      type: "cards",
      cardType: "hotel",
      data: cards,
      reply: `Best hotel match plus ${nearby.length} nearby option${nearby.length === 1 ? "" : "s"}.`,
    },
    sources: [source("Hotel records", SOURCE_PATHS.hotels)],
    summary: cards
      .map((hotel) => `${hotel.rankLabel}: ${hotel.name}, ${hotel.category}, ${hotel.price}, ${hotel.location}`)
      .join("\n"),
  };
}

async function buildTransportResponse(message, memory, location) {
  const routeHint = extractRoute(message);
  const destinationName = routeHint.destination || memory.destination || "";

  if (!location?.lat || !location?.lon) {
    return {
      response: {
        type: "text",
        reply: "Please allow current location access so I can calculate the route from where you are now.",
      },
      sources: [source("Route planner", SOURCE_PATHS.map)],
      summary: "Asked user to allow current location for transport routing.",
    };
  }

  if (!destinationName) {
    return {
      response: {
        type: "text",
        reply: "Where do you want to go? Example: \"take me to Kashi Vishwanath Corridor Gate\".",
      },
      sources: [source("Route planner", SOURCE_PATHS.map)],
      summary: "Asked user for destination.",
    };
  }

  const destination = await geocodePlace(destinationName);
  if (!destination) {
    return {
      response: {
        type: "text",
        reply: `I could not find "${destinationName}" in the website map data. Try a saved place, hotel, restaurant, or attraction name from the site.`,
      },
      sources: [source("Website map places", SOURCE_PATHS.map)],
      summary: "Destination was not found in MapPlace or Hotel records.",
    };
  }

  const routeResult = await computeAndRankRoute({
    start: { lat: Number(location.lat), lng: Number(location.lon) },
    end: { lat: destination.lat, lng: destination.lng },
    optimization: "balanced",
    people: 1,
    transport: "auto",
    profile: "driving",
    alternatives: true,
  });
  const bestRoute =
    routeResult.routes.find((route) => route.routeId === routeResult.bestRouteId) ||
    routeResult.routes[0];
  const transports = await getTransports();
  const routeDistanceKm = Number(bestRoute.distanceMeters || 0) / 1000;
  const fareOptions = await Promise.all(
    transports.slice(0, 8).map(async (transport) => {
      const estimatedDurationSeconds = getEstimatedDurationSeconds({
        transport,
        distanceKm: routeDistanceKm,
        routeDurationSeconds: bestRoute.durationSeconds,
      });
      const fare = await calculateFare({
        transport: transport.name,
        people: 1,
        distanceMeters: bestRoute.distanceMeters,
        durationSeconds: estimatedDurationSeconds,
      });
      const impracticalPenalty = routeDistanceKm > maxReasonableDistanceKm(transport.name)
        ? 100000
        : 0;
      return {
        transport: transport.name,
        fare,
        estimatedDurationSeconds,
        practicalScore:
          Number(fare.totalFare || 0) * 0.55 +
          (estimatedDurationSeconds / 60) * 2.5 +
          impracticalPenalty,
      };
    })
  );
  const bestTransport = selectPracticalTransport({
    fareOptions,
    distanceKm: routeDistanceKm,
  });
  const rejectedWalk = fareOptions.find((option) => isWalkingTransport(option.transport));
  const walkWarning =
    rejectedWalk && routeDistanceKm > maxReasonableDistanceKm(rejectedWalk.transport)
      ? ` Walking is not recommended for ${formatDistanceFromMeters(bestRoute.distanceMeters)}.`
      : "";

  return {
    response: {
      type: "route",
      reply: `Best route to ${destination.name}. Suggested transport: ${bestTransport.transport} (${formatMoney(bestTransport.fare.totalFare)} estimated, about ${formatDurationFromSeconds(bestTransport.estimatedDurationSeconds)}).${walkWarning}`,
      map: {
        center: [Number(location.lat), Number(location.lon)],
        markers: [
          {
            id: "current-location",
            name: "Your current location",
            type: "start",
            latitude: Number(location.lat),
            longitude: Number(location.lon),
          },
          {
            id: "destination",
            name: destination.name,
            type: destination.type || "destination",
            details: destination.details,
            latitude: destination.lat,
            longitude: destination.lng,
          },
        ],
        routes: routeResult.routes,
        bestRouteId: routeResult.bestRouteId,
      },
      summary: {
        destination: destination.name,
        distanceMeters: bestRoute.distanceMeters,
        durationSeconds: bestTransport.estimatedDurationSeconds,
        routeDurationSeconds: bestRoute.durationSeconds,
        transport: bestTransport.transport,
        fare: bestTransport.fare,
        rejectedWalking:
          rejectedWalk && routeDistanceKm > maxReasonableDistanceKm(rejectedWalk.transport)
            ? {
                reason: `Walking is only reasonable up to ${maxReasonableDistanceKm(rejectedWalk.transport)} km in this assistant.`,
                distanceKm: routeDistanceKm,
              }
            : null,
      },
    },
    sources: [source("Route planner API", SOURCE_PATHS.map)],
    summary: `Route to ${destination.name}: ${formatDistanceFromMeters(bestRoute.distanceMeters)}, ${formatDurationFromSeconds(bestTransport.estimatedDurationSeconds)}, ${bestTransport.transport}, ${formatMoney(bestTransport.fare.totalFare)}.`,
  };
}

function boundsAround(location, span = 0.045) {
  const lat = Number(location?.lat || VARANASI_CENTER.lat);
  const lng = Number(location?.lon || location?.lng || VARANASI_CENTER.lng);
  return {
    north: lat + span,
    south: lat - span,
    east: lng + span,
    west: lng - span,
  };
}

async function buildMapResponse(location) {
  if (!isDbReady()) {
    return {
      response: {
        type: "text",
        reply: "The website map data is available after the database connects. Please try again in a moment.",
      },
      sources: [source("Route planner map", SOURCE_PATHS.map)],
      summary: "Map database was unavailable.",
    };
  }

  const bounds = boundsAround(location);
  const places = await getPlacesWithinBounds({
    ...bounds,
    limit: 80,
    types: [],
  });

  return {
    response: {
      type: "map",
      reply: location
        ? "Here are saved website markers around your current location."
        : "Here are saved website markers around central Varanasi.",
      map: {
        center: [Number(location?.lat || VARANASI_CENTER.lat), Number(location?.lon || VARANASI_CENTER.lng)],
        markers: places.map((place) => ({
          id: String(place.id),
          name: place.name,
          type: place.type,
          details: place.details,
          price: place.price,
          latitude: place.latitude,
          longitude: place.longitude,
        })),
      },
    },
    sources: [source("Website map places", SOURCE_PATHS.map)],
    summary: `${places.length} map markers from website data.`,
  };
}

async function buildPlaceCards(type) {
  if (!isDbReady()) {
    return {
      response: {
        type: "text",
        reply: "I can only show saved website data after the database is connected. Please try again when the backend DB is online.",
      },
      sources: [source(type === "restaurant" ? "Food records" : "Place records", type === "restaurant" ? SOURCE_PATHS.food : SOURCE_PATHS.places)],
      summary: "MapPlace database was unavailable.",
    };
  }

  const places = await Place.find({ type })
    .select("name location price type details")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean()
    .exec();

  if (!places.length) {
    return {
      response: {
        type: "text",
        reply: `No ${type === "restaurant" ? "food" : "place"} records are saved on the website yet.`,
      },
      sources: [source("Website map places", SOURCE_PATHS.map)],
      summary: `No ${type} records found.`,
    };
  }

  const cards = places.map((place) => ({
    id: String(place._id),
    name: place.name,
    type: place.type,
    price: formatMoney(place.price),
    details: place.details || "",
    latitude: Number(place.location?.coordinates?.[1]),
    longitude: Number(place.location?.coordinates?.[0]),
  }));

  return {
    response: {
      type: "cards",
      cardType: type === "restaurant" ? "food" : "place",
      reply: type === "restaurant" ? "Food spots saved on the website." : "Places saved on the website.",
      data: cards,
    },
    sources: [source(type === "restaurant" ? "Food section" : "Places section", type === "restaurant" ? SOURCE_PATHS.food : SOURCE_PATHS.places)],
    summary: cards.map((item) => `${item.name}: ${item.details}`).join("\n"),
  };
}

function buildSafetyResponse() {
  const text = [
    "Safety precautions:",
    "- Do not trust random touts, unofficial guides, or strangers offering forced deals.",
    "- Stay in populated, well-lit areas, especially near ghats, markets, stations, and lanes.",
    "- Avoid highly dark or isolated routes after evening.",
    "- Do not roam alone at midnight; travel with your group or use verified transport.",
    "- Agree on auto/taxi fare before starting the ride.",
    "- Keep phone, wallet, and documents zipped and close to your body.",
    "- Share your live location with a trusted person during late travel.",
    "- For emergencies in India, call 112.",
  ].join("\n");

  return {
    response: {
      type: "text",
      reply: text,
    },
    sources: [source("Safety checklist", SOURCE_PATHS.safety)],
    summary: text,
  };
}

async function resolveToolResponse({ intent, message, memory = {}, location = null }) {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("show map") || lower.includes("map") || /\b(nearby|near me|around me)\b/i.test(message)) {
    return buildMapResponse(location);
  }

  if (intent === "hotel") {
    return buildHotelResponse(message, memory);
  }

  if (intent === "transport" || intent === "route") {
    return buildTransportResponse(message, memory, location);
  }

  if (intent === "food") {
    return buildPlaceCards("restaurant");
  }

  if (intent === "place") {
    return buildPlaceCards("attraction");
  }

  if (intent === "safety") {
    return buildSafetyResponse();
  }

  return {
    response: null,
    sources: [],
    summary: "",
  };
}

module.exports = {
  resolveToolResponse,
};
