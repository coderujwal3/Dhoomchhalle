const mongoose = require("mongoose");

const transportPriceSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
            index: true
        },
        destination: {
            type: String,
            required: true,
            index: true
        },
        transportType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TransportType",
            required: true
        },
        officialPrice: {
            type: Number,
            required: true
        },
        approxTime: String,
        distanceKm: Number
    },
    { timestamps: true }
);

transportPriceSchema.index(
    { source: 1, destination: 1, transportType: 1 },
    { unique: true }
);

module.exports = mongoose.model("TransportPrice", transportPriceSchema);