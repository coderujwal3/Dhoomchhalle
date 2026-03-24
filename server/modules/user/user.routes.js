const express = require("express");
const router = express.Router();

const userController = require("./user.controller");
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("./user.validation");
const { validateRequest } = require("../../middlewares/validate.middleware");
const { authLoginLimiter, forgotPasswordLimiter } = require("../../middlewares/rateLimit.middleware");
const { authMiddleware } = require("../../middlewares/auth.middleware");

/**
 * GET requests for /me and for /user/:id controller
 */
router.get("/me", authMiddleware, userController.getMeController);
router.get("/user/:id", userController.getUserByIdController);

/**
 * POST validation requests
 */
router.post("/register", registerValidation, validateRequest, userController.userRegisterController);
router.post("/login", authLoginLimiter, loginValidation, validateRequest, userController.userLoginController);
router.post("/logout", userController.userLogoutController);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidation, validateRequest, userController.forgotPasswordController);
router.post("/reset-password/:token", resetPasswordValidation, validateRequest, userController.resetPasswordController);

module.exports = router;