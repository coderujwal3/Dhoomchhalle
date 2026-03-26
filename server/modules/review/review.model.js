const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: [true, "Hotel ID is required"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must not exceed 5"],
        },
        title: {
            type: String,
            required: [true, "Review title is required"],
            maxlength: [200, "Title must not exceed 200 characters"],
            trim: true,
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            maxlength: [2000, "Comment must not exceed 2000 characters"],
            trim: true,
        },
        visitDate: {
            type: Date,
            required: [true, "Visit date is required"],
        },
        helpful: {
            type: Number,
            default: 0,
        },
        images: [
            {
                type: String, // Cloudinary URLs
            },
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ hotelId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
