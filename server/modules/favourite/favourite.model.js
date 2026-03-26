const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: [true, "Hotel ID is required"],
        },
    },
    { timestamps: true }
);

// Unique constraint: a user can only favorite a hotel once
favouriteSchema.index({ userId: 1, hotelId: 1 }, { unique: true });
favouriteSchema.index({ userId: 1 });

module.exports = mongoose.model("Favourite", favouriteSchema);
