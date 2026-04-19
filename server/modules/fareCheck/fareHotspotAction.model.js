const mongoose = require("mongoose");

const hotspotActionSchema = new mongoose.Schema(
  {
    canonicalRouteKey: {
      type: String,
      required: true,
      index: true,
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
    status: {
      type: String,
      enum: [
        "monitoring",
        "investigating",
        "enforcement-requested",
        "resolved",
        "ignored",
      ],
      default: "monitoring",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastRiskSnapshot: {
      checks: { type: Number, default: 0 },
      highRiskCount: { type: Number, default: 0 },
      mediumRiskCount: { type: Number, default: 0 },
      reportedCount: { type: Number, default: 0 },
      avgOverchargePercent: { type: Number, default: 0 },
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

hotspotActionSchema.index({ canonicalRouteKey: 1, transportType: 1 }, { unique: true });

module.exports = mongoose.model("FareHotspotAction", hotspotActionSchema);
