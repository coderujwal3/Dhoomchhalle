const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxlength: 40,
    },
    costPerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    baseFare: {
      type: Number,
      required: true,
      min: 0,
    },
    extraPassengerCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageSpeedKmph: {
      type: Number,
      default: 24,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MapTransport", transportSchema);
