const express = require("express");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
  mapApiLimiter,
  osrmRouteLimiter,
} = require("../../middlewares/rateLimit.middleware");
const {
  placesBoundsValidation,
  routeRequestValidation,
  fareRequestValidation,
  popularRouteValidation,
} = require("./map.validation");
const {
  getPlacesController,
  postRouteController,
  postFareController,
  getPopularRoutesController,
  getTransportsController,
} = require("./map.controller");

const router = express.Router();

router.get("/places", mapApiLimiter, placesBoundsValidation, validateRequest, getPlacesController);
router.post("/route", osrmRouteLimiter, routeRequestValidation, validateRequest, postRouteController);
router.post("/fare", mapApiLimiter, fareRequestValidation, validateRequest, postFareController);
router.get(
  "/routes/popular",
  mapApiLimiter,
  popularRouteValidation,
  validateRequest,
  getPopularRoutesController
);
router.get("/transports", mapApiLimiter, getTransportsController);

module.exports = router;
