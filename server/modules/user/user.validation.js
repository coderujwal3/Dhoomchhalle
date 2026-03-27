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
    .notEmpty()
    .withMessage("Role is necessary")
    .isIn(['traveller', 'verifier'])
    .withMessage("Role must be either 'traveller' or 'verifier'"),
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

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
