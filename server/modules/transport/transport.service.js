const mongoose = require("mongoose");
const TransportType = require("./transportType.model");
const TransportPrice = require("./transportPrice.model");
const TransportReport = require("./transportReport.model");

const DEFAULT_TRANSPORT_TYPES = [
  "petrol-auto",
  "cng-auto",
  "e-rickshaw",
  "bus-ac",
  "bus-non-ac",
  "janrath",
  "train",
  "ropeway",
];

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function ensureDefaultTransportTypes() {
  const count = await TransportType.countDocuments();
  if (count > 0) return;

  await TransportType.insertMany(
    DEFAULT_TRANSPORT_TYPES.map((typeName) => ({ typeName })),
    { ordered: false }
  );
}

async function getTransportTypes() {
  await ensureDefaultTransportTypes();
  return TransportType.find().sort({ typeName: 1 }).lean().exec();
}

async function resolveTransportType(typeInput, { createIfMissing = true } = {}) {
  const normalized = normalizeText(typeInput).toLowerCase();

  if (!normalized) {
    throw new Error("transportType is required");
  }

  if (mongoose.Types.ObjectId.isValid(normalized)) {
    const byId = await TransportType.findById(normalized).exec();
    if (!byId) throw new Error("Transport type not found");
    return byId;
  }

  const existingType = await TransportType.findOne({
    typeName: normalized,
  }).exec();
  if (existingType) return existingType;

  if (!createIfMissing) {
    return null;
  }

  return TransportType.create({ typeName: normalized });
}

function buildPriceQuery({ source, destination, transportTypeId }) {
  const query = {};
  if (source) {
    query.source = { $regex: escapeRegex(source), $options: "i" };
  }
  if (destination) {
    query.destination = { $regex: escapeRegex(destination), $options: "i" };
  }
  if (transportTypeId) {
    query.transportType = transportTypeId;
  }
  return query;
}

async function listTransportPrices({
  page = 1,
  limit = 20,
  source,
  destination,
  transportType,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const skip = (safePage - 1) * safeLimit;
  const normalizedSource = source ? normalizeText(source) : "";
  const normalizedDestination = destination ? normalizeText(destination) : "";
  let transportTypeId = null;

  if (transportType) {
    const resolved = await resolveTransportType(transportType, {
      createIfMissing: false,
    });
    if (!resolved) {
      return {
        prices: [],
        pagination: {
          total: 0,
          page: safePage,
          pages: 0,
          limit: safeLimit,
        },
      };
    }
    transportTypeId = resolved._id;
  }

  const query = buildPriceQuery({
    source: normalizedSource,
    destination: normalizedDestination,
    transportTypeId,
  });

  const [prices, total] = await Promise.all([
    TransportPrice.find(query)
      .populate("transportType", "typeName")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
    TransportPrice.countDocuments(query),
  ]);

  return {
    prices: prices.map((price) => ({
      ...price,
      transportTypeName: price.transportType?.typeName || "",
    })),
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    },
  };
}

async function createTransportPrice(payload) {
  const type = await resolveTransportType(payload.transportType);

  return TransportPrice.create({
    source: normalizeText(payload.source),
    destination: normalizeText(payload.destination),
    transportType: type._id,
    officialPrice: Number(payload.officialPrice),
    approxTime: payload.approxTime ? normalizeText(payload.approxTime) : "",
    distanceKm:
      payload.distanceKm === undefined ? null : Number(payload.distanceKm),
  });
}

async function updateTransportPrice(priceId, payload) {
  const updatePayload = {};

  if (payload.source !== undefined) {
    updatePayload.source = normalizeText(payload.source);
  }
  if (payload.destination !== undefined) {
    updatePayload.destination = normalizeText(payload.destination);
  }
  if (payload.transportType !== undefined) {
    const type = await resolveTransportType(payload.transportType);
    updatePayload.transportType = type._id;
  }
  if (payload.officialPrice !== undefined) {
    updatePayload.officialPrice = Number(payload.officialPrice);
  }
  if (payload.approxTime !== undefined) {
    updatePayload.approxTime = payload.approxTime
      ? normalizeText(payload.approxTime)
      : "";
  }
  if (payload.distanceKm !== undefined) {
    updatePayload.distanceKm =
      payload.distanceKm === null ? null : Number(payload.distanceKm);
  }

  return TransportPrice.findByIdAndUpdate(
    priceId,
    { $set: updatePayload },
    { new: true, runValidators: true }
  )
    .populate("transportType", "typeName")
    .exec();
}

async function deleteTransportPrice(priceId) {
  return TransportPrice.findByIdAndDelete(priceId).lean().exec();
}

async function createTransportReport(payload) {
  return TransportReport.create({
    user: payload.userId || null,
    transportType: normalizeText(payload.transportType).toLowerCase(),
    source: normalizeText(payload.source),
    destination: normalizeText(payload.destination),
    chargedPrice: Number(payload.chargedPrice),
  });
}

async function listTransportReports({ page = 1, limit = 20, userId = null }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
  const skip = (safePage - 1) * safeLimit;
  const query = userId ? { user: userId } : {};

  const [reports, total] = await Promise.all([
    TransportReport.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
    TransportReport.countDocuments(query),
  ]);

  return {
    reports,
    pagination: {
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      limit: safeLimit,
    },
  };
}

module.exports = {
  getTransportTypes,
  listTransportPrices,
  createTransportPrice,
  updateTransportPrice,
  deleteTransportPrice,
  createTransportReport,
  listTransportReports,
};
