const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true
        },
        location: {
            type: String,
            required: true,
            index: true
        },
        address: {
            type: String,
        },
        category: {
            type: String,
            enum: ["budget", "mid", "luxury", "hostel"],
            required: true
        },
        pricePerNight: {
            type: Number,
            required: true
        },
        contactNumber: String,
        websiteUrl: String,
        mapUrl: String,
        checkIn: String,
        checkOut: String,
        description: String,
        amenities: [String],
        photos: [String],
        avgRating: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);