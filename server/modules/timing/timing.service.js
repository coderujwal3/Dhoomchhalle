const TransportTiming = require("./timing.model");

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTimingQuery({ transportType, routeName, stationName }) {
  const query = {};
  if (transportType) {
    query.transportType = { $regex: escapeRegex(transportType), $options: "i" };
  }
  if (routeName) {
    query.routeName = { $regex: escapeRegex(routeName), $options: "i" };
  }
  if (stationName) {
    query.stationName = { $regex: escapeRegex(stationName), $options: "i" };
  }
  return query;
}

async function listTimings({
  page = 1,
  limit = 20,
  transportType,
  routeName,
  stationName,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const skip = (safePage - 1) * safeLimit;
  const query = buildTimingQuery({
    transportType: transportType ? normalizeText(transportType) : "",
    routeName: routeName ? normalizeText(routeName) : "",
    stationName: stationName ? normalizeText(stationName) : "",
  });

  const [timings, total] = await Promise.all([
    TransportTiming.find(query)
      .sort({ departureTime: 1, updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
    TransportTiming.countDocuments(query),
  ]);

  return {
    timings,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    },
  };
}

async function getTimingById(timingId) {
  return TransportTiming.findById(timingId).lean().exec();
}

async function createTiming(payload) {
  return TransportTiming.create({
    transportType: normalizeText(payload.transportType).toLowerCase(),
    routeName: normalizeText(payload.routeName),
    departureTime: normalizeText(payload.departureTime),
    arrivalTime: payload.arrivalTime ? normalizeText(payload.arrivalTime) : "",
    frequency: payload.frequency ? normalizeText(payload.frequency) : "",
    stationName: payload.stationName ? normalizeText(payload.stationName) : "",
  });
}

async function updateTiming(timingId, payload) {
  const updatePayload = {};

  if (payload.transportType !== undefined) {
    updatePayload.transportType = normalizeText(payload.transportType).toLowerCase();
  }
  if (payload.routeName !== undefined) {
    updatePayload.routeName = normalizeText(payload.routeName);
  }
  if (payload.departureTime !== undefined) {
    updatePayload.departureTime = normalizeText(payload.departureTime);
  }
  if (payload.arrivalTime !== undefined) {
    updatePayload.arrivalTime = payload.arrivalTime
      ? normalizeText(payload.arrivalTime)
      : "";
  }
  if (payload.frequency !== undefined) {
    updatePayload.frequency = payload.frequency ? normalizeText(payload.frequency) : "";
  }
  if (payload.stationName !== undefined) {
    updatePayload.stationName = payload.stationName
      ? normalizeText(payload.stationName)
      : "";
  }

  return TransportTiming.findByIdAndUpdate(
    timingId,
    { $set: updatePayload },
    { new: true, runValidators: true }
  )
    .lean()
    .exec();
}

async function deleteTiming(timingId) {
  return TransportTiming.findByIdAndDelete(timingId).lean().exec();
}

module.exports = {
  listTimings,
  getTimingById,
  createTiming,
  updateTiming,
  deleteTiming,
};
