const xss = require("xss");
const Place = require("./place.model");
const MapRoute = require("./route.model");
const Transport = require("./transport.model");
const {
  CACHE_TTL_MS,
  DEFAULT_OSRM_BASE_URL,
  DEFAULT_PLACES_LIMIT,
  DEFAULT_TRANSPORTS,
  MAX_PLACES_LIMIT,
  MAX_ROUTE_ALTERNATIVES,
} = require("./map.constants");
const { rankRoutes } = require("./routeOptimizer");

const routeCache = new Map();
const placesCache = new Map();

function now() {
  return Date.now();
}

function getCached(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(cache, key, value, ttlMs = CACHE_TTL_MS) {
  cache.set(key, {
    value,
    expiresAt: now() + ttlMs,
  });
}

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return xss(value.trim());
}

function roundCoordinate(value) {
  return Number(Number(value).toFixed(5));
}

function coordHash(coords) {
  return `${roundCoordinate(coords.lat)},${roundCoordinate(coords.lng)}`;
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function getDistanceKm({ distanceMeters, distanceKm }) {
  if (Number.isFinite(distanceKm)) return Number(distanceKm);
  if (Number.isFinite(distanceMeters)) return Number(distanceMeters) / 1000;
  return 0;
}

function validateCoordinatePair(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Invalid coordinates");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordinates are out of allowed range");
  }

  return { lat, lng };
}

function normalizeTransportName(value) {
  return sanitizeText(value).toLowerCase();
}

async function getTransportConfigByName(name) {
  const normalized = normalizeTransportName(name);
  const safeName = normalized || "auto";

  const dbTransport = await Transport.findOne({
    name: safeName,
    isActive: true,
  })
    .lean()
    .exec();
  if (dbTransport) return dbTransport;

  const fallback =
    DEFAULT_TRANSPORTS.find((item) => item.name === safeName) ||
    DEFAULT_TRANSPORTS[0];

  return {
    name: fallback.name,
    costPerKm: fallback.costPerKm,
    baseFare: fallback.baseFare,
    extraPassengerCost: fallback.extraPassengerCost,
    averageSpeedKmph: fallback.averageSpeedKmph,
    isFallback: true,
  };
}

function computeFareBreakdown({
  distanceKm,
  people,
  durationSeconds,
  transportConfig,
}) {
  const normalizedPeople = Number.isFinite(people)
    ? Math.max(1, Math.floor(people))
    : 1;
  const normalizedDistanceKm = Math.max(0, Number(distanceKm) || 0);

  const distanceCost = normalizedDistanceKm * Number(transportConfig.costPerKm);
  const extraPassengerCost =
    Math.max(0, normalizedPeople - 1) *
    Number(transportConfig.extraPassengerCost || 0);
  const totalFare =
    Number(transportConfig.baseFare) + distanceCost + extraPassengerCost;

  const resolvedDurationSeconds = Number.isFinite(durationSeconds)
    ? Math.max(0, Number(durationSeconds))
    : Math.max(
        0,
        (normalizedDistanceKm / Number(transportConfig.averageSpeedKmph || 1)) *
          3600
      );

  return {
    totalFare: roundCurrency(totalFare),
    costPerPerson: roundCurrency(totalFare / normalizedPeople),
    estimatedTravelTimeSeconds: Math.round(resolvedDurationSeconds),
    people: normalizedPeople,
    distanceKm: roundCurrency(normalizedDistanceKm),
    transport: {
      name: transportConfig.name,
      costPerKm: Number(transportConfig.costPerKm),
      baseFare: Number(transportConfig.baseFare),
      extraPassengerCost: Number(transportConfig.extraPassengerCost || 0),
      averageSpeedKmph: Number(transportConfig.averageSpeedKmph || 1),
    },
    fareBreakdown: {
      distanceCost: roundCurrency(distanceCost),
      extraPassengerCost: roundCurrency(extraPassengerCost),
      baseFare: roundCurrency(transportConfig.baseFare),
    },
  };
}

function toPolyline(geoJsonCoordinates) {
  if (!Array.isArray(geoJsonCoordinates)) return [];
  return geoJsonCoordinates
    .filter((pair) => Array.isArray(pair) && pair.length === 2)
    .map(([lng, lat]) => [lat, lng]);
}

function osrmProfile(profile) {
  const value = sanitizeText(profile).toLowerCase();
  if (value === "walking" || value === "cycling") return value;
  return "driving";
}

function routeCacheKey({ start, end, profile, alternatives }) {
  return [
    profile,
    coordHash(start),
    coordHash(end),
    alternatives ? "alt1" : "alt0",
  ].join("|");
}

function buildOsrmUrl({ start, end, profile, alternatives }) {
  const osrmBaseUrl = (process.env.OSRM_BASE_URL || DEFAULT_OSRM_BASE_URL).replace(
    /\/+$/,
    ""
  );
  const params = new URLSearchParams({
    alternatives: alternatives ? "true" : "false",
    geometries: "geojson",
    overview: "full",
    steps: "false",
    annotations: "false",
  });

  return `${osrmBaseUrl}/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?${params.toString()}`;
}

async function fetchOsrmRouteOptions({ start, end, profile, alternatives }) {
  const key = routeCacheKey({ start, end, profile, alternatives });
  const cached = getCached(routeCache, key);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const url = buildOsrmUrl({ start, end, profile, alternatives });
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`OSRM responded with status ${response.status}`);
    }

    const payload = await response.json();
    const routes = Array.isArray(payload?.routes) ? payload.routes : [];
    if (payload?.code !== "Ok" || routes.length === 0) {
      throw new Error("No route data available from OSRM");
    }

    const transformed = routes.slice(0, MAX_ROUTE_ALTERNATIVES).map((route, i) => ({
      routeId: `route_${i + 1}`,
      distanceMeters: Number(route.distance || 0),
      durationSeconds: Number(route.duration || 0),
      geometry: Array.isArray(route?.geometry?.coordinates)
        ? route.geometry.coordinates
        : [],
    }));

    setCached(routeCache, key, transformed);
    return transformed;
  } finally {
    clearTimeout(timeout);
  }
}

function buildPlacesCacheKey({ north, south, east, west, types, limit }) {
  const typeKey = Array.isArray(types) ? [...types].sort().join(",") : "";
  return `north:${north}|south:${south}|east:${east}|west:${west}|types:${typeKey}|limit:${limit}`;
}

async function getPlacesWithinBounds({ north, south, east, west, types, limit }) {
  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || DEFAULT_PLACES_LIMIT, MAX_PLACES_LIMIT)
  );
  const normalizedTypes = Array.isArray(types)
    ? types
        .map((item) => sanitizeText(item).toLowerCase())
        .filter((item) => item.length > 0)
    : [];

  const cacheKey = buildPlacesCacheKey({
    north,
    south,
    east,
    west,
    types: normalizedTypes,
    limit: safeLimit,
  });
  const cached = getCached(placesCache, cacheKey);
  if (cached) return cached;

  const query = {};
  if (normalizedTypes.length) {
    query.type = { $in: normalizedTypes };
  }

  if (east >= west) {
    query.location = {
      $geoWithin: {
        $box: [
          [west, south],
          [east, north],
        ],
      },
    };
  } else {
    query.$or = [
      {
        location: {
          $geoWithin: {
            $box: [
              [-180, south],
              [east, north],
            ],
          },
        },
      },
      {
        location: {
          $geoWithin: {
            $box: [
              [west, south],
              [180, north],
            ],
          },
        },
      },
    ];
  }

  const places = await Place.find(query)
    .select("name location price type details")
    .limit(safeLimit)
    .lean()
    .exec();

  const response = places.map((place) => ({
    id: place._id,
    name: place.name,
    price: Number(place.price || 0),
    type: place.type,
    details: place.details || "",
    latitude: Number(place.location?.coordinates?.[1]),
    longitude: Number(place.location?.coordinates?.[0]),
  }));

  setCached(placesCache, cacheKey, response, 30 * 1000);
  return response;
}

async function calculateFare(payload) {
  const transportName = sanitizeText(payload.transport || "auto");
  const people = Number(payload.people || 1);
  const distanceKm = getDistanceKm({
    distanceMeters: Number(payload.distanceMeters),
    distanceKm: Number(payload.distanceKm),
  });
  const durationSeconds = Number(payload.durationSeconds);
  const transportConfig = await getTransportConfigByName(transportName);

  return computeFareBreakdown({
    distanceKm,
    people,
    durationSeconds,
    transportConfig,
  });
}

async function increaseRouteUsage({
  start,
  end,
  profile,
  distanceMeters,
  durationSeconds,
  costEstimate,
}) {
  await MapRoute.findOneAndUpdate(
    {
      startHash: coordHash(start),
      endHash: coordHash(end),
      profile,
    },
    {
      $set: {
        start: { type: "Point", coordinates: [start.lng, start.lat] },
        end: { type: "Point", coordinates: [end.lng, end.lat] },
        distanceMeters: Number(distanceMeters),
        durationSeconds: Number(durationSeconds),
        costEstimate: Number(costEstimate || 0),
        lastUsedAt: new Date(),
      },
      $inc: { usageCount: 1 },
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true,
    }
  ).exec();
}

async function computeAndRankRoute(payload) {
  const start = validateCoordinatePair(payload.start);
  const end = validateCoordinatePair(payload.end);
  const profile = osrmProfile(payload.profile);
  const alternatives = payload.alternatives !== false;
  const people = Math.max(1, Number(payload.people || 1));
  const transportName = sanitizeText(payload.transport || "auto");

  const routeOptions = await fetchOsrmRouteOptions({
    start,
    end,
    profile,
    alternatives,
  });

  const transportConfig = await getTransportConfigByName(transportName);
  const routesWithFare = routeOptions.map((route) => {
    const distanceKm = Number(route.distanceMeters || 0) / 1000;
    const fare = computeFareBreakdown({
      distanceKm,
      people,
      durationSeconds: route.durationSeconds,
      transportConfig,
    });

    return {
      ...route,
      travelCost: fare.totalFare,
      fare,
      polyline: toPolyline(route.geometry),
    };
  });

  const ranked = rankRoutes(routesWithFare, {
    preset: payload.optimization,
    weights: payload.weights,
  });

  const bestRoute = ranked.routes.find((route) => route.isBest) || ranked.routes[0];
  if (bestRoute) {
    await increaseRouteUsage({
      start,
      end,
      profile,
      distanceMeters: bestRoute.distanceMeters,
      durationSeconds: bestRoute.durationSeconds,
      costEstimate: bestRoute.travelCost,
    });
  }

  return {
    start,
    end,
    profile,
    optimization: ranked.preset,
    scoringWeights: ranked.weights,
    routes: ranked.routes,
    bestRouteId: bestRoute?.routeId || null,
    transport: {
      name: transportConfig.name,
      people,
    },
  };
}

async function getPopularRoutes(limit = 12) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 12, 50));
  const routes = await MapRoute.find({})
    .sort({ usageCount: -1, lastUsedAt: -1 })
    .limit(safeLimit)
    .lean()
    .exec();

  return routes.map((route) => ({
    id: route._id,
    profile: route.profile,
    usageCount: route.usageCount,
    distanceMeters: Number(route.distanceMeters || 0),
    durationSeconds: Number(route.durationSeconds || 0),
    costEstimate: Number(route.costEstimate || 0),
    start: {
      lat: Number(route.start?.coordinates?.[1]),
      lng: Number(route.start?.coordinates?.[0]),
    },
    end: {
      lat: Number(route.end?.coordinates?.[1]),
      lng: Number(route.end?.coordinates?.[0]),
    },
    lastUsedAt: route.lastUsedAt,
  }));
}

async function getTransports() {
  const transports = await Transport.find({ isActive: true })
    .select("name costPerKm baseFare extraPassengerCost averageSpeedKmph")
    .sort({ name: 1 })
    .lean()
    .exec();

  if (transports.length) return transports;
  return DEFAULT_TRANSPORTS;
}

module.exports = {
  getPlacesWithinBounds,
  computeAndRankRoute,
  calculateFare,
  getPopularRoutes,
  getTransports,
};
