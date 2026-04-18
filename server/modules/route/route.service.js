const RouteModel = require("./route.model");

const TRAFFIC_STATUSES = ["low", "medium", "high"];

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function buildRegex(value) {
  const safe = normalizeText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(safe, "i");
}

function buildRouteQuery({ source, destination, trafficStatus, search }) {
  const query = {};

  if (source) {
    query.source = buildRegex(source);
  }

  if (destination) {
    query.destination = buildRegex(destination);
  }

  if (TRAFFIC_STATUSES.includes(trafficStatus)) {
    query.trafficStatus = trafficStatus;
  }

  if (search) {
    const pattern = buildRegex(search);
    query.$or = [{ source: pattern }, { destination: pattern }];
  }

  return query;
}

async function listRoutes({
  page = 1,
  limit = 10,
  source,
  destination,
  trafficStatus,
  search,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const skip = (safePage - 1) * safeLimit;
  const query = buildRouteQuery({ source, destination, trafficStatus, search });

  const [routes, total] = await Promise.all([
    RouteModel.find(query).sort({ updatedAt: -1 }).skip(skip).limit(safeLimit),
    RouteModel.countDocuments(query),
  ]);

  return {
    routes,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    },
  };
}

async function getRouteById(routeId) {
  return RouteModel.findById(routeId);
}

async function createRoute(payload) {
  const route = await RouteModel.create({
    source: normalizeText(payload.source),
    destination: normalizeText(payload.destination),
    totalDistance:
      payload.totalDistance === undefined ? null : Number(payload.totalDistance),
    fastestTime: payload.fastestTime ? normalizeText(payload.fastestTime) : "",
    cheapestCost:
      payload.cheapestCost === undefined ? null : Number(payload.cheapestCost),
    trafficStatus: payload.trafficStatus || undefined,
    mapLink: payload.mapLink ? String(payload.mapLink).trim() : "",
  });

  return route;
}

async function updateRoute(routeId, payload) {
  const updatePayload = {};

  if (payload.source !== undefined) {
    updatePayload.source = normalizeText(payload.source);
  }
  if (payload.destination !== undefined) {
    updatePayload.destination = normalizeText(payload.destination);
  }
  if (payload.totalDistance !== undefined) {
    updatePayload.totalDistance =
      payload.totalDistance === null ? null : Number(payload.totalDistance);
  }
  if (payload.fastestTime !== undefined) {
    updatePayload.fastestTime = payload.fastestTime
      ? normalizeText(payload.fastestTime)
      : "";
  }
  if (payload.cheapestCost !== undefined) {
    updatePayload.cheapestCost =
      payload.cheapestCost === null ? null : Number(payload.cheapestCost);
  }
  if (payload.trafficStatus !== undefined) {
    updatePayload.trafficStatus = payload.trafficStatus || undefined;
  }
  if (payload.mapLink !== undefined) {
    updatePayload.mapLink = payload.mapLink ? String(payload.mapLink).trim() : "";
  }

  return RouteModel.findByIdAndUpdate(
    routeId,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );
}

async function deleteRoute(routeId) {
  return RouteModel.findByIdAndDelete(routeId);
}

module.exports = {
  listRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
};
