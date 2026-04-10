const mongoose = require("mongoose");

const pointSchema = {
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator(value) {
        return Array.isArray(value) && value.length === 2;
      },
      message: "Coordinates must contain [longitude, latitude]",
    },
  },
};

const routeSchema = new mongoose.Schema(
  {
    start: pointSchema,
    end: pointSchema,
    startHash: {
      type: String,
      required: true,
      index: true,
    },
    endHash: {
      type: String,
      required: true,
      index: true,
    },
    profile: {
      type: String,
      default: "driving",
      enum: ["driving", "walking", "cycling"],
    },
    distanceMeters: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    costEstimate: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

routeSchema.index({ startHash: 1, endHash: 1, profile: 1 }, { unique: true });
routeSchema.index({ usageCount: -1, lastUsedAt: -1 });

module.exports = mongoose.model("MapRoute", routeSchema);
