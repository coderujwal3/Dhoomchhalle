const { body, param, query } = require("express-validator");

const TRAFFIC_STATUSES = ["low", "medium", "high"];

const listRoutesValidation = [
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
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("search must be between 1 and 120 characters"),
  query("trafficStatus")
    .optional()
    .isIn(TRAFFIC_STATUSES)
    .withMessage("trafficStatus must be low, medium, or high"),
];

const createRouteValidation = [
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
  body("totalDistance")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("totalDistance must be a non-negative number")
    .toFloat(),
  body("fastestTime")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("fastestTime must not exceed 80 characters"),
  body("cheapestCost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("cheapestCost must be a non-negative number")
    .toFloat(),
  body("trafficStatus")
    .optional({ nullable: true })
    .isIn(TRAFFIC_STATUSES)
    .withMessage("trafficStatus must be low, medium, or high"),
  body("mapLink")
    .optional({ nullable: true })
    .isURL()
    .withMessage("mapLink must be a valid URL"),
];

const routeIdValidation = [
  param("routeId").isMongoId().withMessage("Invalid route ID"),
];

const updateRouteValidation = [
  ...routeIdValidation,
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
  body("totalDistance")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("totalDistance must be a non-negative number")
    .toFloat(),
  body("fastestTime")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage("fastestTime must not exceed 80 characters"),
  body("cheapestCost")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("cheapestCost must be a non-negative number")
    .toFloat(),
  body("trafficStatus")
    .optional({ nullable: true })
    .isIn(TRAFFIC_STATUSES)
    .withMessage("trafficStatus must be low, medium, or high"),
  body("mapLink")
    .optional({ nullable: true })
    .isURL()
    .withMessage("mapLink must be a valid URL"),
];

module.exports = {
  listRoutesValidation,
  createRouteValidation,
  routeIdValidation,
  updateRouteValidation,
};
