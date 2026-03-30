const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        "email": {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                , "Invalid Email"]
        },
        name: {
            type: String,
            required: [true, "Name is required"]
        },
        password: {
            type: String,
            required: [true, "Password is necessary"],
            minlength: [6, "Password should be atleast 6 characters long"],
            select: false
        },
        phone: {
            type: String,
            required: [true, "Phone number is required for sending you the latest updates via SMS"],
        },
        role: {
            type: String,
            enum: ["traveller", "admin", "verifier"],
            default: "traveller"
        },
        suspended: {
            type: Boolean,
            default: false
        },
        suspensionReason: {
            type: String,
            default: null
        },
        suspendedAt: {
            type: Date,
            default: null
        },
        resetPasswordToken: {
            type: String,
            select: false
        },
        resetPasswordExpires: {
            type: Date,
            select: false
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
        lastLoginIp: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    this.password = await bcrypt.hash(this.password, 10);
    return
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", userSchema);