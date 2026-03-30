const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  otpValidation,
  resendOTPValidation,
  refreshTokenValidation,
} = require("./user.validation");
const { validateRequest } = require("../../middlewares/validate.middleware");
const { authLoginLimiter, otpLimiter, otpVerifyLimiter, forgotPasswordLimiter } = require("../../middlewares/rateLimit.middleware");
const { authMiddleware } = require("../../middlewares/auth.middleware");

/**
 * GET requests for /me, /user/:id, and /login-activity
 */
router.get("/me", authMiddleware, userController.getMeController);
router.get("/user/:id", userController.getUserByIdController);
router.get("/login-activity", authMiddleware, userController.getLoginActivityController);

/**
 * POST validation requests
 */
router.post("/register", registerValidation, validateRequest, userController.userRegisterController);
router.post("/login", authLoginLimiter, loginValidation, validateRequest, userController.userLoginController);

/**
 * 2FA - OTP routes
 */
router.post("/verify-otp", otpVerifyLimiter, otpValidation, validateRequest, userController.verifyOTPController);
router.post("/resend-otp", otpLimiter, resendOTPValidation, validateRequest, userController.resendOTPController);

/**
 * 2FA enable/disable routes
 */
router.post("/enable-2fa", authMiddleware, userController.enable2FAController);
router.post("/disable-2fa", authMiddleware, userController.disable2FAController);

/**
 * Refresh token route
 */
router.post("/refresh-token", refreshTokenValidation, validateRequest, userController.refreshAccessTokenController);

/**
 * Logout route
 */
router.post("/logout", authMiddleware, userController.userLogoutController);

/**
 * Password management routes
 */
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidation, validateRequest, userController.forgotPasswordController);
router.post("/reset-password/:token", resetPasswordValidation, validateRequest, userController.resetPasswordController);

module.exports = router;
