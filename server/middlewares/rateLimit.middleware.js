const rateLimit = require("express-rate-limit");

const authLoginLimiter = rateLimit({
  windowMs: 8 * 60 * 1000,
  limit: 7,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many login attempts. Please try again in 10 minutes.",
  },
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 3, // Max 3 OTP requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many OTP requests. Please try again in 5 minutes.",
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 OTP verification attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many verification attempts. Please try again later.",
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many requests. Please try again in 15 minutes.",
  },
});

module.exports = {
  authLoginLimiter,
  otpLimiter,
  otpVerifyLimiter,
  forgotPasswordLimiter,
};
