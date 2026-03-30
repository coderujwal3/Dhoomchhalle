const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true, // Hashed OTP
        },
        purpose: {
            type: String,
            enum: ["login", "enable_2fa"],
            default: "login",
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Auto-delete expired OTPs
        },
        attempts: {
            type: Number,
            default: 0,
            max: 5, // Max 5 attempts
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
