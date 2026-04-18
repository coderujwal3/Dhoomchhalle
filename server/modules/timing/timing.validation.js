const { body, param, query } = require("express-validator");

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const listTimingsValidation = [
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
  query("transportType")
    .optional()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  query("routeName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 140 })
    .withMessage("routeName must be between 2 and 140 characters"),
  query("stationName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 140 })
    .withMessage("stationName must be between 2 and 140 characters"),
];

const createTimingValidation = [
  body("transportType")
    .notEmpty()
    .withMessage("transportType is required")
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  body("routeName")
    .notEmpty()
    .withMessage("routeName is required")
    .trim()
    .isLength({ min: 2, max: 140 })
    .withMessage("routeName must be between 2 and 140 characters"),
  body("departureTime")
    .notEmpty()
    .withMessage("departureTime is required")
    .matches(TIME_REGEX)
    .withMessage("departureTime must be in HH:mm format"),
  body("arrivalTime")
    .optional({ nullable: true })
    .matches(TIME_REGEX)
    .withMessage("arrivalTime must be in HH:mm format"),
  body("frequency")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("frequency must not exceed 80 characters"),
  body("stationName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 140 })
    .withMessage("stationName must not exceed 140 characters"),
];

const timingIdValidation = [
  param("timingId").isMongoId().withMessage("Invalid timing ID"),
];

const updateTimingValidation = [
  ...timingIdValidation,
  body("transportType")
    .optional()
    .trim()
    .isLength({ min: 2, max: 64 })
    .withMessage("transportType must be between 2 and 64 characters"),
  body("routeName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 140 })
    .withMessage("routeName must be between 2 and 140 characters"),
  body("departureTime")
    .optional()
    .matches(TIME_REGEX)
    .withMessage("departureTime must be in HH:mm format"),
  body("arrivalTime")
    .optional({ nullable: true })
    .matches(TIME_REGEX)
    .withMessage("arrivalTime must be in HH:mm format"),
  body("frequency")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("frequency must not exceed 80 characters"),
  body("stationName")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 140 })
    .withMessage("stationName must not exceed 140 characters"),
];

module.exports = {
  listTimingsValidation,
  createTimingValidation,
  timingIdValidation,
  updateTimingValidation,
};
