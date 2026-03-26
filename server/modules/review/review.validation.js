const { body } = require("express-validator");

const createReviewValidation = [
    body("hotelId")
        .notEmpty()
        .withMessage("Hotel ID is required")
        .isMongoId()
        .withMessage("Invalid Hotel ID format"),

    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("title")
        .notEmpty()
        .withMessage("Review title is required")
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Title must be between 5 and 200 characters"),

    body("comment")
        .notEmpty()
        .withMessage("Review comment is required")
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Comment must be between 10 and 2000 characters"),

    body("visitDate")
        .notEmpty()
        .withMessage("Visit date is required")
        .isISO8601()
        .withMessage("Invalid date format. Use ISO 8601 format"),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array")
        .custom((value) => {
            if (value && value.length > 5) {
                throw new Error("Maximum 5 images allowed");
            }
            return true;
        }),
];

const updateReviewValidation = [
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("title")
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Title must be between 5 and 200 characters"),

    body("comment")
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage("Comment must be between 10 and 2000 characters"),

    body("visitDate")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format. Use ISO 8601 format"),

    body("images")
        .optional()
        .isArray()
        .withMessage("Images must be an array")
        .custom((value) => {
            if (value && value.length > 5) {
                throw new Error("Maximum 5 images allowed");
            }
            return true;
        }),
];

module.exports = {
    createReviewValidation,
    updateReviewValidation,
};
