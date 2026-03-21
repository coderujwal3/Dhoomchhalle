const rateLimit = require("express-rate-limit");

const authLoginLimiter = rateLimit({
  windowMs: 8 * 60 * 1000,
  limit: 7,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "failed",
    message: "Too many login attempts. Please try again in 15 minutes.",
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
  forgotPasswordLimiter,
};
