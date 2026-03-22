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


tokenBlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 2 })


const tokenBlacklistModel = mongoose.model('tokenBlacklist', tokenBlacklistSchema);
module.exports = tokenBlacklistModel;