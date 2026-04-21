const FareCheckLog = require("./fareCheck.model");
const FareHotspotAction = require("./fareHotspotAction.model");
const TransportLog = require("../transportLog/transportLog.model");
const { calculateFare } = require("../map/map.service");
const Place = require("../map/place.model");
const Hotel = require("../hotel/hotel.model");

const TRANSPORT_TO_MAP_MODE = {
  "petrol-auto": "auto",
  "cng-auto": "auto",
  "e-rickshaw": "auto",
  "bus-ac": "bus",
  "bus-non-ac": "bus",
  janrath: "bus",
  train: "cab",
  ropeway: "cab",
};

const FALLBACK_RANGE_BY_TYPE = {
  "petrol-auto": { min: 80, max: 220 },
  "cng-auto": { min: 70, max: 200 },
  "e-rickshaw": { min: 50, max: 160 },
  "bus-ac": { min: 25, max: 90 },
  "bus-non-ac": { min: 15, max: 60 },
  "janrath": { min: 80, max: 1000 },
  "train": { min: 40, max: 180 },
  "ropeway": { min: 70, max: 120 },
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizedLocationRegex(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .map((part) => escapeRegex(part))
    .join("\\s+");
}

function normalizeLocation(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function severityScore({ checks, highRiskCount, reportedCount, avgOverchargePercent }) {
  return roundCurrency(
    Number(checks || 0) * 0.5 +
      Number(highRiskCount || 0) * 2 +
      Number(reportedCount || 0) * 1.25 +
      Number(avgOverchargePercent || 0) * 0.1
  );
}

function suggestedAdminAction({ checks, highRiskCount, avgOverchargePercent }) {
  if (Number(highRiskCount) >= 5 || Number(avgOverchargePercent) >= 45) {
    return "enforcement-requested";
  }
  if (Number(highRiskCount) >= 2 || Number(checks) >= 8) {
    return "investigating";
  }
  return "monitoring";
}

function toCanonicalRouteKey(fromLocation, toLocation) {
  const sorted = [normalizeLocation(fromLocation), normalizeLocation(toLocation)].sort();
  return `${sorted[0]}::${sorted[1]}`;
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function quantile(sortedNumbers, q) {
  if (!sortedNumbers.length) return 0;
  const pos = (sortedNumbers.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const current = sortedNumbers[base];
  const next = sortedNumbers[base + 1] ?? current;
  return current + rest * (next - current);
}

function buildRecommendation(riskLevel) {
  if (riskLevel === "high") {
    return "Possible overcharge detected. Negotiate or choose another ride and report if needed.";
  }
  if (riskLevel === "medium") {
    return "Fare appears slightly high. Consider negotiating before confirming the ride.";
  }
  return "Quote looks fair for this route and transport mode.";
}

function resolveRiskLevel({ quotedFare, expectedFareMax }) {
  if (!Number.isFinite(expectedFareMax) || expectedFareMax <= 0) return "low";
  const overchargePercent = ((quotedFare - expectedFareMax) / expectedFareMax) * 100;

  if (overchargePercent >= 35) return "high";
  if (overchargePercent >= 12) return "medium";
  return "low";
}

function resolveConfidence({ dataSource, sampleSize }) {
  if (dataSource === "transport-log") {
    if (sampleSize >= 12) return "high";
    if (sampleSize >= 5) return "medium";
  }
  if (dataSource === "distance-model") return "medium";
  return "low";
}

async function findMatchingTransportLogs({ fromLocation, toLocation, transportType }) {
  const fromPattern = new RegExp(`^${normalizedLocationRegex(fromLocation)}$`, "i");
  const toPattern = new RegExp(`^${normalizedLocationRegex(toLocation)}$`, "i");

  const logs = await TransportLog.find({
    transportType,
    $or: [
      { fromLocation: fromPattern, toLocation: toPattern },
      { fromLocation: toPattern, toLocation: fromPattern },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(250)
    .select("fare")
    .lean()
    .exec();

  return logs
    .map((log) => Number(log.fare))
    .filter((fare) => Number.isFinite(fare) && fare >= 0);
}

function estimateRangeFromHistory(fares) {
  if (fares.length < 3) return null;
  const sorted = [...fares].sort((a, b) => a - b);

  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = Math.max(1, q3 - q1);

  let min = Math.max(0, q1 - 0.5 * iqr);
  let max = q3 + 0.75 * iqr;

  if (max - min < 10) {
    min = Math.max(0, median * 0.9);
    max = median * 1.15;
  }

  return {
    expectedFareMin: roundCurrency(min),
    expectedFareMax: roundCurrency(max),
    expectedFareMid: roundCurrency(median),
    sampleSize: fares.length,
    dataSource: "transport-log",
  };
}

async function estimateRangeFromDistance({ transportType, distanceKm, people }) {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) {
    return null;
  }

  const mapTransport = TRANSPORT_TO_MAP_MODE[transportType] || "auto";
  const fareResult = await calculateFare({
    transport: mapTransport,
    people: Math.max(1, Number(people || 1)),
    distanceKm: Number(distanceKm),
  });

  const estimated = Number(fareResult?.totalFare || 0);
  if (!Number.isFinite(estimated) || estimated <= 0) {
    return null;
  }

  return {
    expectedFareMin: roundCurrency(estimated * 0.85),
    expectedFareMax: roundCurrency(estimated * 1.2),
    expectedFareMid: roundCurrency(estimated),
    sampleSize: 0,
    dataSource: "distance-model",
  };
}

function fallbackRange(transportType) {
  const range = FALLBACK_RANGE_BY_TYPE[transportType] || { min: 60, max: 220 };
  return {
    expectedFareMin: range.min,
    expectedFareMax: range.max,
    expectedFareMid: roundCurrency((range.min + range.max) / 2),
    sampleSize: 0,
    dataSource: "fallback",
  };
}

async function evaluateFareCheck(payload) {
  const fromLocation = String(payload.fromLocation || "").trim();
  const toLocation = String(payload.toLocation || "").trim();
  const transportType = String(payload.transportType || "").trim();
  const quotedFare = Number(payload.quotedFare);
  const distanceKm =
    payload.distanceKm === null || payload.distanceKm === undefined
      ? null
      : Number(payload.distanceKm);
  const people = Math.max(1, Number(payload.people || 1));

  const normalizedFrom = normalizeLocation(fromLocation);
  const normalizedTo = normalizeLocation(toLocation);
  const canonicalRouteKey = toCanonicalRouteKey(fromLocation, toLocation);
  const routeLabel = `${fromLocation} -> ${toLocation}`;

  const historicalFares = await findMatchingTransportLogs({
    fromLocation: normalizedFrom,
    toLocation: normalizedTo,
    transportType,
  });

  const historyRange = estimateRangeFromHistory(historicalFares);
  const distanceRange = historyRange
    ? null
    : await estimateRangeFromDistance({ transportType, distanceKm, people });

  const range = historyRange || distanceRange || fallbackRange(transportType);
  const riskLevel = resolveRiskLevel({
    quotedFare,
    expectedFareMax: range.expectedFareMax,
  });
  const confidence = resolveConfidence({
    dataSource: range.dataSource,
    sampleSize: range.sampleSize,
  });

  const differenceAmount = roundCurrency(quotedFare - range.expectedFareMid);
  const differencePercent =
    range.expectedFareMid > 0
      ? roundCurrency((differenceAmount / range.expectedFareMid) * 100)
      : 0;
  const overchargeAmount = roundCurrency(
    Math.max(0, quotedFare - range.expectedFareMax)
  );
  const overchargePercent =
    range.expectedFareMax > 0
      ? roundCurrency((overchargeAmount / range.expectedFareMax) * 100)
      : 0;
  const recommendation = buildRecommendation(riskLevel);

  const log = await FareCheckLog.create({
    userId: payload.userId || null,
    fromLocation,
    toLocation,
    normalizedFrom,
    normalizedTo,
    canonicalRouteKey,
    routeLabel,
    transportType,
    quotedFare: roundCurrency(quotedFare),
    people,
    distanceKm: Number.isFinite(distanceKm) ? distanceKm : null,
    expectedFareMin: range.expectedFareMin,
    expectedFareMax: range.expectedFareMax,
    expectedFareMid: range.expectedFareMid,
    differenceAmount,
    differencePercent,
    overchargeAmount,
    overchargePercent,
    riskLevel,
    confidence,
    recommendation,
    dataSource: range.dataSource,
    sampleSize: range.sampleSize,
  });

  return {
    fareCheckId: log._id,
    fromLocation,
    toLocation,
    routeLabel,
    transportType,
    quotedFare: log.quotedFare,
    expectedFareMin: log.expectedFareMin,
    expectedFareMax: log.expectedFareMax,
    expectedFareMid: log.expectedFareMid,
    differenceAmount: log.differenceAmount,
    differencePercent: log.differencePercent,
    overchargeAmount: log.overchargeAmount,
    overchargePercent: log.overchargePercent,
    riskLevel: log.riskLevel,
    confidence: log.confidence,
    recommendation: log.recommendation,
    dataSource: log.dataSource,
    sampleSize: log.sampleSize,
  };
}

async function reportFareCheck(payload) {
  const fareCheckId =
    typeof payload.fareCheckId === "string" ? payload.fareCheckId.trim() : "";

  if (!fareCheckId || !FareCheckLog.isValidObjectId(fareCheckId)) {
    throw new Error("Invalid fare check id");
  }

  const updatePayload = {
    wasReported: true,
    reportReason: payload.reason || "other",
    reportNotes: String(payload.notes || "").trim(),
    reportedAt: new Date(),
  };

  if (payload.userId) {
    updatePayload.userId = payload.userId;
  }

  const updatedLog = await FareCheckLog.findByIdAndUpdate(
    fareCheckId,
    { $set: updatePayload },
    { new: true }
  )
    .lean()
    .exec();

  if (!updatedLog) {
    throw new Error("Fare check record not found");
  }

  return {
    fareCheckId: updatedLog._id,
    wasReported: updatedLog.wasReported,
    reportReason: updatedLog.reportReason,
    reportNotes: updatedLog.reportNotes,
    reportedAt: updatedLog.reportedAt,
  };
}

function risksFromMinRisk(minRisk = "medium") {
  if (minRisk === "low") return ["low", "medium", "high"];
  if (minRisk === "high") return ["high"];
  return ["medium", "high"];
}

async function lookupPlaceCoordinates(locationName) {
  const safeName = String(locationName || "").trim();
  if (!safeName) return null;

  const escaped = escapeRegex(safeName);
  const exactPattern = new RegExp(`^${escaped}$`, "i");

  const place = await Place.findOne({ name: exactPattern })
    .select("location.coordinates")
    .lean()
    .exec();

  const placeCoordinates = place?.location?.coordinates || [];
  if (
    Array.isArray(placeCoordinates) &&
    placeCoordinates.length === 2 &&
    Number.isFinite(Number(placeCoordinates[0])) &&
    Number.isFinite(Number(placeCoordinates[1]))
  ) {
    return {
      lng: Number(placeCoordinates[0]),
      lat: Number(placeCoordinates[1]),
      source: "place",
    };
  }

  const hotel = await Hotel.findOne({
    $or: [{ name: exactPattern }, { location: exactPattern }],
  })
    .select("latitude longitude")
    .lean()
    .exec();

  if (
    hotel &&
    Number.isFinite(Number(hotel.latitude)) &&
    Number.isFinite(Number(hotel.longitude))
  ) {
    return {
      lat: Number(hotel.latitude),
      lng: Number(hotel.longitude),
      source: "hotel",
    };
  }

  return null;
}

async function enrichHotspotsWithGeo(hotspots) {
  const coordinateCache = new Map();

  async function getCoords(locationName) {
    const key = normalizeLocation(locationName);
    if (!key) return null;
    if (coordinateCache.has(key)) return coordinateCache.get(key);

    const resolved = await lookupPlaceCoordinates(locationName);
    coordinateCache.set(key, resolved);
    return resolved;
  }

  return Promise.all(
    hotspots.map(async (spot) => {
      const [fromCoordinates, toCoordinates] = await Promise.all([
        getCoords(spot.fromLocation),
        getCoords(spot.toLocation),
      ]);

      return {
        ...spot,
        fromCoordinates,
        toCoordinates,
      };
    })
  );
}

async function getFareRiskHotspots({ limit = 20, days = 30, minRisk = "medium" }) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - Number(days || 30));

  const hotspots = await FareCheckLog.aggregate([
    {
      $match: {
        createdAt: { $gte: sinceDate },
        riskLevel: { $in: risksFromMinRisk(minRisk) },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          routeKey: "$canonicalRouteKey",
          transportType: "$transportType",
        },
        routeLabel: { $first: "$routeLabel" },
        fromLocation: { $first: "$fromLocation" },
        toLocation: { $first: "$toLocation" },
        latestAt: { $first: "$createdAt" },
        checks: { $sum: 1 },
        highRiskCount: {
          $sum: { $cond: [{ $eq: ["$riskLevel", "high"] }, 1, 0] },
        },
        mediumRiskCount: {
          $sum: { $cond: [{ $eq: ["$riskLevel", "medium"] }, 1, 0] },
        },
        reportedCount: {
          $sum: { $cond: ["$wasReported", 1, 0] },
        },
        avgQuotedFare: { $avg: "$quotedFare" },
        avgExpectedMax: { $avg: "$expectedFareMax" },
        avgOverchargeAmount: { $avg: "$overchargeAmount" },
        avgOverchargePercent: { $avg: "$overchargePercent" },
      },
    },
    {
      $sort: {
        highRiskCount: -1,
        avgOverchargePercent: -1,
        checks: -1,
      },
    },
    { $limit: Math.max(1, Math.min(Number(limit || 20), 50)) },
  ]);

  const normalizedHotspots = hotspots.map((spot) => ({
    routeKey: spot._id.routeKey,
    transportType: spot._id.transportType,
    routeLabel: spot.routeLabel,
    fromLocation: spot.fromLocation,
    toLocation: spot.toLocation,
    checks: spot.checks,
    highRiskCount: spot.highRiskCount,
    mediumRiskCount: spot.mediumRiskCount,
    reportedCount: spot.reportedCount,
    avgQuotedFare: roundCurrency(spot.avgQuotedFare || 0),
    avgExpectedMax: roundCurrency(spot.avgExpectedMax || 0),
    avgOverchargeAmount: roundCurrency(spot.avgOverchargeAmount || 0),
    avgOverchargePercent: roundCurrency(spot.avgOverchargePercent || 0),
    severityScore: severityScore({
      checks: spot.checks,
      highRiskCount: spot.highRiskCount,
      reportedCount: spot.reportedCount,
      avgOverchargePercent: spot.avgOverchargePercent,
    }),
    suggestedAction: suggestedAdminAction({
      checks: spot.checks,
      highRiskCount: spot.highRiskCount,
      avgOverchargePercent: spot.avgOverchargePercent,
    }),
    latestAt: spot.latestAt,
  }));

  if (!normalizedHotspots.length) {
    return [];
  }

  const actions = await FareHotspotAction.find({
    $or: normalizedHotspots.map((spot) => ({
      canonicalRouteKey: spot.routeKey,
      transportType: spot.transportType,
    })),
  })
    .populate("assignedTo", "name email")
    .populate("updatedBy", "name email")
    .lean()
    .exec();

  const actionMap = new Map(
    actions.map((action) => [
      `${action.canonicalRouteKey}::${action.transportType}`,
      {
        status: action.status,
        priority: action.priority,
        notes: action.notes,
        assignedTo: action.assignedTo || null,
        updatedBy: action.updatedBy || null,
        updatedAt: action.updatedAt,
        resolvedAt: action.resolvedAt,
      },
    ])
  );

  const hotspotsWithAction = normalizedHotspots.map((spot) => ({
    ...spot,
    action:
      actionMap.get(`${spot.routeKey}::${spot.transportType}`) || {
        status: "monitoring",
        priority: "medium",
        notes: "",
        assignedTo: null,
        updatedBy: null,
        updatedAt: null,
        resolvedAt: null,
      },
  }));

  return enrichHotspotsWithGeo(hotspotsWithAction);
}

async function getUserFareCheckHistory({
  userId,
  page = 1,
  limit = 10,
  riskLevel,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const skip = (safePage - 1) * safeLimit;
  const normalizedRiskLevel =
    typeof riskLevel === "string" ? riskLevel.trim().toLowerCase() : "";

  const query = { userId };
  if (["low", "medium", "high"].includes(normalizedRiskLevel)) {
    query.riskLevel = { $eq: normalizedRiskLevel };
  }

  const [records, total] = await Promise.all([
    FareCheckLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
    FareCheckLog.countDocuments(query),
  ]);

  return {
    records,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    },
  };
}

async function upsertHotspotAction(payload) {
  const routeKey = String(payload.routeKey || "").trim();
  const transportType = String(payload.transportType || "").trim();

  const existing = await FareCheckLog.findOne({
    canonicalRouteKey: routeKey,
    transportType,
  })
    .select("canonicalRouteKey transportType")
    .lean()
    .exec();

  if (!existing) {
    throw new Error("Hotspot route not found");
  }

  const actionPayload = {
    status: payload.status,
    priority: payload.priority || "medium",
    notes: String(payload.notes || "").trim(),
    assignedTo: payload.assignedTo || null,
    updatedBy: payload.updatedBy,
    resolvedAt: payload.status === "resolved" ? new Date() : null,
  };

  if (payload.lastRiskSnapshot && typeof payload.lastRiskSnapshot === "object") {
    actionPayload.lastRiskSnapshot = payload.lastRiskSnapshot;
  }

  return FareHotspotAction.findOneAndUpdate(
    {
      canonicalRouteKey: routeKey,
      transportType,
    },
    { $set: actionPayload },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  )
    .populate("assignedTo", "name email")
    .populate("updatedBy", "name email")
    .lean()
    .exec();
}

module.exports = {
  evaluateFareCheck,
  reportFareCheck,
  getFareRiskHotspots,
  getUserFareCheckHistory,
  upsertHotspotAction,
};
