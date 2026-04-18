const express = require("express");
const { authSystemUserMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const timingController = require("./timing.controller");
const {
  listTimingsValidation,
  createTimingValidation,
  timingIdValidation,
  updateTimingValidation,
} = require("./timing.validation");

const router = express.Router();

router.get("/", listTimingsValidation, validateRequest, timingController.listTimingsController);
router.get(
  "/:timingId",
  timingIdValidation,
  validateRequest,
  timingController.getTimingByIdController
);
router.post(
  "/",
  authSystemUserMiddleware,
  createTimingValidation,
  validateRequest,
  timingController.createTimingController
);
router.put(
  "/:timingId",
  authSystemUserMiddleware,
  updateTimingValidation,
  validateRequest,
  timingController.updateTimingController
);
router.delete(
  "/:timingId",
  authSystemUserMiddleware,
  timingIdValidation,
  validateRequest,
  timingController.deleteTimingController
);

module.exports = router;
