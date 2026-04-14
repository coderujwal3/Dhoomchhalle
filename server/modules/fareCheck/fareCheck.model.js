const mongoose = require("mongoose");

const fareCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    fromLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    toLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    normalizedFrom: {
      type: String,
      required: true,
      index: true,
    },
    normalizedTo: {
      type: String,
      required: true,
      index: true,
    },
    canonicalRouteKey: {
      type: String,
      required: true,
      index: true,
    },
    routeLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 260,
    },
    transportType: {
      type: String,
      enum: [
        "petrol-auto",
        "cng-auto",
        "e-rickshaw",
        "bus-ac",
        "bus-non-ac",
        "janrath",
        "train",
        "ropeway",
      ],
      required: true,
      index: true,
    },
    quotedFare: {
      type: Number,
      required: true,
      min: 0,
    },
    people: {
      type: Number,
      default: 1,
      min: 1,
      max: 20,
    },
    distanceKm: {
      type: Number,
      default: null,
      min: 0,
    },
    expectedFareMin: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedFareMax: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedFareMid: {
      type: Number,
      required: true,
      min: 0,
    },
    differenceAmount: {
      type: Number,
      default: 0,
    },
    differencePercent: {
      type: Number,
      default: 0,
    },
    overchargeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    overchargePercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      index: true,
    },
    confidence: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
      maxlength: 240,
    },
    dataSource: {
      type: String,
      enum: ["transport-log", "distance-model", "fallback"],
      required: true,
      index: true,
    },
    sampleSize: {
      type: Number,
      default: 0,
      min: 0,
    },
    wasReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportReason: {
      type: String,
      enum: ["overcharge", "misbehavior", "route-manipulation", "other", null],
      default: null,
    },
    reportNotes: {
      type: String,
      default: "",
      maxlength: 500,
      trim: true,
    },
    reportedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

fareCheckSchema.index({ canonicalRouteKey: 1, transportType: 1, createdAt: -1 });
fareCheckSchema.index({ riskLevel: 1, createdAt: -1 });

module.exports = mongoose.model("FareCheckLog", fareCheckSchema);
