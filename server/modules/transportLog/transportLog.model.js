const mongoose = require("mongoose");

const transportLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        transportType: {
            type: String,
            enum: ["petrol-auto", "cng-auto", "e-rickshaw", "bus-ac", "bus-non-ac", "janrath", "train", "ropeway"],
            required: [true, "Transport type is required"],
        },
        fromLocation: {
            type: String,
            required: [true, "From location is required"],
        },
        toLocation: {
            type: String,
            required: [true, "To location is required"],
        },
        fare: {
            type: Number,
            required: [true, "Fare is required"],
            min: 0,
        },
        actualPrice: {
            type: Number,
            default: null,
        },
        distance: {
            type: Number, // in km
            default: null,
        },
        time: {
            type: Number, // in minutes
            default: null,
        },
        journeyDate: {
            type: Date,
            required: [true, "Journey date is required"],
        },
        notes: {
            type: String,
            maxlength: 500,
            default: "",
        },
    },
    { timestamps: true }
);

transportLogSchema.index({ userId: 1 });
transportLogSchema.index({ journeyDate: -1 });

module.exports = mongoose.model("TransportLog", transportLogSchema);
