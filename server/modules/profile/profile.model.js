const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
            sparse: true, // Allow multiple null values
        },
        bio: {
            type: String,
            maxlength: 500,
            default: "",
        },
        avatar: {
            type: String, // Cloudinary URL
            default: null,
        },
        location: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        preferences: {
            currency: {
                type: String,
                default: "INR",
            },
            language: {
                type: String,
                default: "English",
            },
            notifications: {
                type: Boolean,
                default: true,
            },
            emailNotifications: {
                type: Boolean,
                default: true,
            },
        },
        stats: {
            tripsCompleted: {
                type: Number,
                default: 0,
            },
            hotelsVisited: {
                type: Number,
                default: 0,
            },
            reviewsWritten: {
                type: Number,
                default: 0,
            },
            averageRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
        },
        memberSince: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
