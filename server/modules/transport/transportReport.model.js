const mongoose = require("mongoose");

const transportReportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        transportType: String,
        source: String,
        destination: String,
        chargedPrice: Number
    },
    { timestamps: true }
);

module.exports = mongoose.model("TransportReport", transportReportSchema);