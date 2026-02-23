const mongoose = require("mongoose");

const transportTimingSchema = new mongoose.Schema(
    {
        transportType: {
            type: String,
            required: true
        },
        routeName: String,
        departureTime: String,
        arrivalTime: String,
        frequency: String,
        stationName: String
    },
    { timestamps: true }
);

module.exports = mongoose.model("TransportTiming", transportTimingSchema);