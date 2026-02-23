const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String
        },
        role: {
            type: String,
            enum: ["traveller", "admin", "verifier"],
            default: "traveller"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);