const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["success", "failed", "otp_pending", "otp_verified"],
            default: "success",
        },
        reason: {
            type: String,
            default: null, // e.g., "Invalid password", "Account suspended"
        },
        twoFactorAuthenticated: {
            type: Boolean,
            default: false,
        },
        loginTime: {
            type: Date,
            default: Date.now,
        },
        logoutTime: {
            type: Date,
            default: null,
        },
        sessionDuration: {
            type: Number, // in seconds
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("LoginActivity", loginActivitySchema);
