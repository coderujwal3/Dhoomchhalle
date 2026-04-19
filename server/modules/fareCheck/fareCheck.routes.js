const express = require("express");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
  authSystemUserMiddleware,
  authMiddleware,
  optionalAuthMiddleware,
} = require("../../middlewares/auth.middleware");
const fareCheckController = require("./fareCheck.controller");
const {
  evaluateFareValidation,
  reportFareCheckValidation,
  fareHotspotsValidation,
  myFareChecksValidation,
  hotspotActionValidation,
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
  "/me",
  authMiddleware,
  myFareChecksValidation,
  validateRequest,
  fareCheckController.getMyFareChecksController
);

router.get(
  "/hotspots",
  authSystemUserMiddleware,
  fareHotspotsValidation,
  validateRequest,
  fareCheckController.getFareHotspotsController
);

router.post(
  "/hotspots/action",
  authSystemUserMiddleware,
  hotspotActionValidation,
  validateRequest,
  fareCheckController.upsertHotspotActionController
);

module.exports = router;
