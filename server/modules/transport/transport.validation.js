const { body, param, query } = require("express-validator");

const listTransportPricesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),
  query("source")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("source must be between 2 and 120 characters"),
  query("destination")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("destination must be between 2 and 120 characters"),
  query("transportType")
    .optional()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
];

const createTransportPriceValidation = [
  body("source")
    .notEmpty()
    .withMessage("source is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("source must be between 2 and 120 characters"),
  body("destination")
    .notEmpty()
    .withMessage("destination is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("destination must be between 2 and 120 characters"),
  body("transportType")
    .notEmpty()
    .withMessage("transportType is required")
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  body("officialPrice")
    .notEmpty()
    .withMessage("officialPrice is required")
    .isFloat({ min: 0 })
    .withMessage("officialPrice must be a non-negative number")
    .toFloat(),
  body("approxTime")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("approxTime must not exceed 80 characters"),
  body("distanceKm")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("distanceKm must be a non-negative number")
    .toFloat(),
];

const updateTransportPriceValidation = [
  param("priceId").isMongoId().withMessage("Invalid price ID"),
  body("source")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("source must be between 2 and 120 characters"),
  body("destination")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("destination must be between 2 and 120 characters"),
  body("transportType")
    .optional()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  body("officialPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("officialPrice must be a non-negative number")
    .toFloat(),
  body("approxTime")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("approxTime must not exceed 80 characters"),
  body("distanceKm")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("distanceKm must be a non-negative number")
    .toFloat(),
];

const createTransportReportValidation = [
  body("transportType")
    .notEmpty()
    .withMessage("transportType is required")
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  body("source")
    .notEmpty()
    .withMessage("source is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("source must be between 2 and 120 characters"),
  body("destination")
    .notEmpty()
    .withMessage("destination is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("destination must be between 2 and 120 characters"),
  body("chargedPrice")
    .notEmpty()
    .withMessage("chargedPrice is required")
    .isFloat({ min: 0 })
    .withMessage("chargedPrice must be a non-negative number")
    .toFloat(),
];

const transportReportsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100")
    .toInt(),
  query("onlyMine")
    .optional()
    .isIn(["true", "false"])
    .withMessage("onlyMine must be true or false"),
];

const priceIdValidation = [param("priceId").isMongoId().withMessage("Invalid price ID")];

module.exports = {
  listTransportPricesValidation,
  createTransportPriceValidation,
  updateTransportPriceValidation,
  createTransportReportValidation,
  transportReportsValidation,
  priceIdValidation,
};
