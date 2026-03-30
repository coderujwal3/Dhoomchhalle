const { body } = require("express-validator");

const STRONG_PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name should be between 2 and 60 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+\d{9,15}$/)
    .withMessage("Please provide a valid phone number with country code (e.g., +919876543210)"),
  body("role")
    .optional()
    .custom(() => {
      throw new Error("Role cannot be assigned during self-registration");
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(STRONG_PASSWORD_RULE)
    .withMessage(
      "Password must be 8-64 chars and include uppercase, lowercase, number, and special character",
    ),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password and confirm password must match"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 64 })
    .withMessage("Password length should be between 8 and 64 characters"),
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(STRONG_PASSWORD_RULE)
    .withMessage(
      "Password must be 8-64 chars and include uppercase, lowercase, number, and special character",
    ),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password and confirm password must match"),
];

const otpValidation = [
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  body("otpSessionToken")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("OTP session token cannot be empty"),
  body("purpose")
    .optional()
    .isIn(["login", "enable_2fa"])
    .withMessage("Invalid OTP purpose"),
];

const resendOTPValidation = [
  body("otpSessionToken")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("OTP session token cannot be empty"),
  body("purpose")
    .optional()
    .isIn(["login", "enable_2fa"])
    .withMessage("Invalid OTP purpose"),
];

const refreshTokenValidation = [
  body("refreshToken")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required if provided in body"),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  otpValidation,
  resendOTPValidation,
  refreshTokenValidation,
};
