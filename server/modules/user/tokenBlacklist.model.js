const mongoose = require('mongoose')

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required"],
        unique: [true, "Token already exists"]
    },
}, {
    timestamps: true
})


tokenBlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 3 })


const tokenBlacklistModel = mongoose.model('tokenBlacklist', tokenBlacklistSchema);
module.exports = tokenBlacklistModel;