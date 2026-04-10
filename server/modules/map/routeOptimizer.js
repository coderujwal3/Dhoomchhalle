const { DEFAULT_ROUTE_PRESET, ROUTE_PRESETS } = require("./map.constants");

function clampWeight(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, value));
}

function normalizePreset(preset) {
  if (typeof preset !== "string") return DEFAULT_ROUTE_PRESET;
  if (Object.prototype.hasOwnProperty.call(ROUTE_PRESETS, preset)) return preset;
  return DEFAULT_ROUTE_PRESET;
}

function resolveWeights({ preset, weights }) {
  const resolvedPreset = normalizePreset(preset);
  const defaults = ROUTE_PRESETS[resolvedPreset];

  if (!weights || typeof weights !== "object") {
    return defaults;
  }

  const distanceWeight = clampWeight(Number(weights.distanceWeight));
  const timeWeight = clampWeight(Number(weights.timeWeight));
  const costWeight = clampWeight(Number(weights.costWeight));

  if (distanceWeight === 0 && timeWeight === 0 && costWeight === 0) {
    return defaults;
  }

  return { distanceWeight, timeWeight, costWeight };
}

function calculateScore(route, weights) {
  const distanceKm = Number(route.distanceMeters || 0) / 1000;
  const durationMinutes = Number(route.durationSeconds || 0) / 60;
  const travelCost = Number(route.travelCost || 0);

  return (
    weights.distanceWeight * distanceKm +
    weights.timeWeight * durationMinutes +
    weights.costWeight * travelCost
  );
}

function rankRoutes(routes, options = {}) {
  const weights = resolveWeights(options);
  const scoredRoutes = routes.map((route) => {
    const score = calculateScore(route, weights);
    return { ...route, score };
  });

  scoredRoutes.sort((a, b) => a.score - b.score);
  const bestRouteId = scoredRoutes[0]?.routeId || null;

  return {
    weights,
    preset: normalizePreset(options.preset),
    routes: scoredRoutes.map((route) => ({
      ...route,
      isBest: route.routeId === bestRouteId,
    })),
  };
}

module.exports = {
  rankRoutes,
  resolveWeights,
};
