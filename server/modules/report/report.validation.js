const { body, param } = require("express-validator");

const createReportValidation = [
  body("entityType")
    .notEmpty()
    .withMessage("Entity type is required")
    .isIn(["hotel", "review", "transport", "other"])
    .withMessage("Invalid entity type"),
  body("entityId")
    .notEmpty()
    .withMessage("Entity ID is required")
    .isMongoId()
    .withMessage("Invalid entity ID format"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["spam", "inappropriate", "false-info", "offensive", "scam", "other"])
    .withMessage("Invalid category"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),
];

const updateReportStatusValidation = [
  param("reportId").isMongoId().withMessage("Invalid report ID format"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["open", "in-review", "resolved", "dismissed"])
    .withMessage("Invalid status"),
  body("adminNotes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Admin notes must not exceed 1000 characters"),
];

module.exports = {
  createReportValidation,
  updateReportStatusValidation,
};
