const { body, validationResult } = require("express-validator");

const updateProfileValidation = [
    body("bio")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Bio must not exceed 500 characters"),

    body("location")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Location must not exceed 100 characters"),

    body("phone")
        .optional()
        .trim()
        .matches(/^[\d\+\-\s\(\)]+$/)
        .withMessage("Invalid phone format"),

    body("preferences.currency")
        .optional()
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage("Invalid currency"),

    body("preferences.language")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Invalid language"),

    body("preferences.notifications")
        .optional()
        .isBoolean()
        .withMessage("Notifications must be a boolean"),

    body("preferences.emailNotifications")
        .optional()
        .isBoolean()
        .withMessage("Email notifications must be a boolean"),
];

const updateAvatarValidation = [
    body("avatarUrl")
        .notEmpty()
        .withMessage("Avatar URL is required")
        .trim()
        .isURL()
        .withMessage("Avatar URL must be a valid URL"),
];

module.exports = {
    updateProfileValidation,
    updateAvatarValidation,
};
