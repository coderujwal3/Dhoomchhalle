const { body, param } = require("express-validator");

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

const createTransportLogValidation = [
  body("transportType")
    .notEmpty()
    .withMessage("Transport type is required")
    .isIn(transportTypes)
    .withMessage("Invalid transport type"),
  body("fromLocation")
    .notEmpty()
    .withMessage("From location is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("From location must be between 2 and 120 characters"),
  body("toLocation")
    .notEmpty()
    .withMessage("To location is required")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("To location must be between 2 and 120 characters"),
  body("fare")
    .notEmpty()
    .withMessage("Fare is required")
    .isFloat({ min: 0 })
    .withMessage("Fare must be a non-negative number"),
  body("journeyDate")
    .notEmpty()
    .withMessage("Journey date is required")
    .isISO8601()
    .withMessage("Journey date must be a valid ISO date"),
  body("actualPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Actual price must be a non-negative number"),
  body("distance")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Distance must be a non-negative number"),
  body("time")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Time must be a non-negative number"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

const updateTransportLogValidation = [
  param("logId").isMongoId().withMessage("Invalid log ID format"),
  body("transportType").optional().isIn(transportTypes).withMessage("Invalid transport type"),
  body("fromLocation")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("From location must be between 2 and 120 characters"),
  body("toLocation")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("To location must be between 2 and 120 characters"),
  body("fare").optional().isFloat({ min: 0 }).withMessage("Fare must be a non-negative number"),
  body("journeyDate")
    .optional()
    .isISO8601()
    .withMessage("Journey date must be a valid ISO date"),
  body("actualPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Actual price must be a non-negative number"),
  body("distance")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Distance must be a non-negative number"),
  body("time")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Time must be a non-negative number"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),
];

module.exports = {
  createTransportLogValidation,
  updateTransportLogValidation,
};
