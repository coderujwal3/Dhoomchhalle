const DEFAULT_OSRM_BASE_URL = "https://router.project-osrm.org";

const ROUTE_PRESETS = {
  cheapest: { distanceWeight: 0.2, timeWeight: 0.2, costWeight: 0.6 },
  fastest: { distanceWeight: 0.1, timeWeight: 0.75, costWeight: 0.15 },
  balanced: { distanceWeight: 0.35, timeWeight: 0.35, costWeight: 0.3 },
};

const DEFAULT_ROUTE_PRESET = "balanced";
const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_ROUTE_ALTERNATIVES = 3;
const DEFAULT_PLACES_LIMIT = 400;
const MAX_PLACES_LIMIT = 1500;

const DEFAULT_TRANSPORTS = [
  {
    name: "auto",
    costPerKm: 14,
    baseFare: 25,
    extraPassengerCost: 4,
    averageSpeedKmph: 26,
  },
  {
    name: "cab",
    costPerKm: 18,
    baseFare: 60,
    extraPassengerCost: 8,
    averageSpeedKmph: 34,
  },
  {
    name: "bus",
    costPerKm: 7,
    baseFare: 10,
    extraPassengerCost: 1,
    averageSpeedKmph: 22,
  },
  {
    name: "bike",
    costPerKm: 9,
    baseFare: 15,
    extraPassengerCost: 3,
    averageSpeedKmph: 28,
  },
  {
    name: "walk",
    costPerKm: 0,
    baseFare: 0,
    extraPassengerCost: 0,
    averageSpeedKmph: 4.8,
  },
];

module.exports = {
  DEFAULT_OSRM_BASE_URL,
  ROUTE_PRESETS,
  DEFAULT_ROUTE_PRESET,
  CACHE_TTL_MS,
  MAX_ROUTE_ALTERNATIVES,
  DEFAULT_PLACES_LIMIT,
  MAX_PLACES_LIMIT,
  DEFAULT_TRANSPORTS,
};
