const express = require("express");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
  authSystemUserMiddleware,
  optionalAuthMiddleware,
} = require("../../middlewares/auth.middleware");
const fareCheckController = require("./fareCheck.controller");
const {
  evaluateFareValidation,
  reportFareCheckValidation,
  fareHotspotsValidation,
} = require("./fareCheck.validation");

const router = express.Router();

router.post(
  "/evaluate",
  optionalAuthMiddleware,
  evaluateFareValidation,
  validateRequest,
  fareCheckController.evaluateFareController
);

router.post(
  "/report",
  optionalAuthMiddleware,
  reportFareCheckValidation,
  validateRequest,
  fareCheckController.reportFareController
);

router.get(
  "/hotspots",
  authSystemUserMiddleware,
  fareHotspotsValidation,
  validateRequest,
  fareCheckController.getFareHotspotsController
);

module.exports = router;
