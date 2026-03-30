const bcrypt = require("bcrypt");

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP using bcrypt
 * @param {string} otp - Plain OTP
 * @returns {Promise<string>} Hashed OTP
 */
async function hashOTP(otp) {
    return await bcrypt.hash(otp, 10);
}

/**
 * Verify OTP against hashed OTP
 * @param {string} otp - Plain OTP
 * @param {string} hashedOtp - Hashed OTP from database
 * @returns {Promise<boolean>} true if matches, false otherwise
 */
async function verifyOTP(otp, hashedOtp) {
    return await bcrypt.compare(otp, hashedOtp);
}

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
};
