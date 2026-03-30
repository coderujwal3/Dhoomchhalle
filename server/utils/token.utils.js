const jwt = require("jsonwebtoken");

const TOKEN_EXPIRY = "7d"; // 7 days
const REFRESH_TOKEN_EXPIRY = "30d"; // 30 days

/**
 * Generate access token (7 days expiry)
 * @param {string} userId - User ID
 * @returns {string} JWT access token
 */
function generateAccessToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: TOKEN_EXPIRY }
    );
}

/**
 * Generate refresh token (30 days expiry)
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(userId) {
    return jwt.sign(
        { userId, type: "refresh" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
}

/**
 * Decode token and verify it
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload or null if invalid
 */
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
};
