const { body, query } = require("express-validator");
const {
  DEFAULT_PLACES_LIMIT,
  MAX_PLACES_LIMIT,
  ROUTE_PRESETS,
} = require("./map.constants");

const coordinateValidation = (field, min, max, label) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required`)
    .isFloat({ min, max })
    .withMessage(`${label} must be between ${min} and ${max}`)
    .toFloat();

const placesBoundsValidation = [
  query("north")
    .notEmpty()
    .withMessage("north is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("north must be between -90 and 90")
    .toFloat(),
  query("south")
    .notEmpty()
    .withMessage("south is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("south must be between -90 and 90")
    .toFloat(),
  query("east")
    .notEmpty()
    .withMessage("east is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("east must be between -180 and 180")
    .toFloat(),
  query("west")
    .notEmpty()
    .withMessage("west is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("west must be between -180 and 180")
    .toFloat(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: MAX_PLACES_LIMIT })
    .withMessage(`limit must be between 1 and ${MAX_PLACES_LIMIT}`)
    .toInt(),
  query("types")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.trim() !== "") {
        return value.split(",").map((item) => item.trim());
      }
      return [];
    }),
  query("north").custom((north, { req }) => {
    if (north < req.query.south) {
      throw new Error("north must be greater than or equal to south");
    }
    return true;
  }),
  query("limit").default(DEFAULT_PLACES_LIMIT),
];

const routeRequestValidation = [
  coordinateValidation("start.lat", -90, 90, "start.lat"),
  coordinateValidation("start.lng", -180, 180, "start.lng"),
  coordinateValidation("end.lat", -90, 90, "end.lat"),
  coordinateValidation("end.lng", -180, 180, "end.lng"),
  body("profile")
    .optional()
    .isIn(["driving", "walking", "cycling"])
    .withMessage("profile must be one of driving, walking, cycling"),
  body("optimization")
    .optional()
    .isIn(Object.keys(ROUTE_PRESETS))
    .withMessage(`optimization must be one of ${Object.keys(ROUTE_PRESETS).join(", ")}`),
  body("weights.distanceWeight")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("weights.distanceWeight must be between 0 and 10")
    .toFloat(),
  body("weights.timeWeight")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("weights.timeWeight must be between 0 and 10")
    .toFloat(),
  body("weights.costWeight")
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage("weights.costWeight must be between 0 and 10")
    .toFloat(),
  body("people")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("people must be between 1 and 20")
    .toInt(),
  body("transport")
    .optional()
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("transport must be between 2 and 40 characters"),
  body("alternatives")
    .optional()
    .isBoolean()
    .withMessage("alternatives must be a boolean")
    .toBoolean(),
];

const fareRequestValidation = [
  body("transport")
    .notEmpty()
    .withMessage("transport is required")
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("transport must be between 2 and 40 characters"),
  body("people")
    .notEmpty()
    .withMessage("people is required")
    .isInt({ min: 1, max: 20 })
    .withMessage("people must be between 1 and 20")
    .toInt(),
  body("distanceMeters")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("distanceMeters must be a positive number")
    .toFloat(),
  body("distanceKm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("distanceKm must be a positive number")
    .toFloat(),
  body().custom((value) => {
    if (!Number.isFinite(value.distanceMeters) && !Number.isFinite(value.distanceKm)) {
      throw new Error("Either distanceMeters or distanceKm is required");
    }
    return true;
  }),
  body("durationSeconds")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("durationSeconds must be a positive number")
    .toFloat(),
];

const popularRouteValidation = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50")
    .toInt(),
];

module.exports = {
  placesBoundsValidation,
  routeRequestValidation,
  fareRequestValidation,
  popularRouteValidation,
};
