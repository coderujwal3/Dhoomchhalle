const express = require("express");
const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const transportController = require("./transport.controller");
const {
  listTransportPricesValidation,
  createTransportPriceValidation,
  updateTransportPriceValidation,
  createTransportReportValidation,
  transportReportsValidation,
  priceIdValidation,
} = require("./transport.validation");

const router = express.Router();

router.get("/types", transportController.getTransportTypesController);
router.get(
  "/prices",
  listTransportPricesValidation,
  validateRequest,
  transportController.getTransportPricesController
);
router.post(
  "/prices",
  authSystemUserMiddleware,
  createTransportPriceValidation,
  validateRequest,
  transportController.createTransportPriceController
);
router.put(
  "/prices/:priceId",
  authSystemUserMiddleware,
  updateTransportPriceValidation,
  validateRequest,
  transportController.updateTransportPriceController
);
router.delete(
  "/prices/:priceId",
  authSystemUserMiddleware,
  priceIdValidation,
  validateRequest,
  transportController.deleteTransportPriceController
);

router.post(
  "/reports",
  authMiddleware,
  createTransportReportValidation,
  validateRequest,
  transportController.createTransportReportController
);
router.get(
  "/reports",
  authSystemUserMiddleware,
  transportReportsValidation,
  validateRequest,
  transportController.getTransportReportsController
);

module.exports = router;
