const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        totalDistance: Number,
        fastestTime: String,
        cheapestCost: Number,
        trafficStatus: {
            type: String,
            enum: ["low", "medium", "high"]
        },
        mapLink: String
    },
    { timestamps: true }
);

routeSchema.index({ source: 1, destination: 1 }, { unique: true });

module.exports = mongoose.model("Route", routeSchema);