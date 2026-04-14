const { body, query } = require("express-validator");

const transportTypes = [
  "petrol-auto",
  "cng-auto",
  "e-rickshaw",
  "bus-ac",
  "bus-non-ac",
  "janrath",
  "train",
  "ropeway",
];

const evaluateFareValidation = [
  body("fromLocation")
    .notEmpty()
    .withMessage("fromLocation is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("fromLocation must be between 2 and 120 characters"),
  body("toLocation")
    .notEmpty()
    .withMessage("toLocation is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("toLocation must be between 2 and 120 characters"),
  body("transportType")
    .notEmpty()
    .withMessage("transportType is required")
    .isIn(transportTypes)
    .withMessage("Invalid transportType"),
  body("quotedFare")
    .notEmpty()
    .withMessage("quotedFare is required")
    .isFloat({ min: 0 })
    .withMessage("quotedFare must be a non-negative number")
    .toFloat(),
  body("distanceKm")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("distanceKm must be a non-negative number")
    .toFloat(),
  body("people")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("people must be between 1 and 20")
    .toInt(),
];

const reportFareCheckValidation = [
  body("fareCheckId")
    .notEmpty()
    .withMessage("fareCheckId is required")
    .isMongoId()
    .withMessage("Invalid fareCheckId"),
  body("reason")
    .optional()
    .isIn(["overcharge", "misbehavior", "route-manipulation", "other"])
    .withMessage("Invalid report reason"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("notes must be less than or equal to 500 characters"),
];

const fareHotspotsValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50")
    .toInt(),
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("days must be between 1 and 365")
    .toInt(),
  query("minRisk")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("minRisk must be one of low, medium, high"),
];

module.exports = {
  evaluateFareValidation,
  reportFareCheckValidation,
  fareHotspotsValidation,
  transportTypes,
};
