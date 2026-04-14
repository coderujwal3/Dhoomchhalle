const FareCheckLog = require("./fareCheck.model");
const TransportLog = require("../transportLog/transportLog.model");
const { calculateFare } = require("../map/map.service");

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

  return hotspots.map((spot) => ({
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
    latestAt: spot.latestAt,
  }));
}

module.exports = {
  evaluateFareCheck,
  reportFareCheck,
  getFareRiskHotspots,
};
