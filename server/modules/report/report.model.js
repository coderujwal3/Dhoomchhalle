const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        entityType: {
            type: String,
            enum: ["hotel", "review", "transport", "other"],
            required: [true, "Entity type is required"],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Entity ID is required"],
        },
        category: {
            type: String,
            enum: ["spam", "inappropriate", "false-info", "offensive", "scam", "other"],
            required: [true, "Report category is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [2000, "Description must not exceed 2000 characters"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["open", "in-review", "resolved", "dismissed"],
            default: "open",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        adminNotes: {
            type: String,
            default: "",
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

reportSchema.index({ userId: 1 });
reportSchema.index({ entityType: 1, entityId: 1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model("Report", reportSchema);
