const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    location: {
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
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    type: {
      type: String,
      trim: true,
      default: "other",
      enum: ["hotel", "restaurant", "attraction", "transport", "other"],
      index: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
    },
  },
  { timestamps: true }
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MapPlace", placeSchema);
