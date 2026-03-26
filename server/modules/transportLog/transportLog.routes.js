const express = require("express");
const router = express.Router();
const transportLogController = require("./transportLog.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
  createTransportLogValidation,
  updateTransportLogValidation,
} = require("./transportLog.validation");

router.post(
  "/",
  authMiddleware,
  createTransportLogValidation,
  validateRequest,
  transportLogController.createTransportLogController
);
router.get("/me", authMiddleware, transportLogController.getMyLogsController);
router.put(
  "/:logId",
  authMiddleware,
  updateTransportLogValidation,
  validateRequest,
  transportLogController.updateLogController
);
router.delete("/:logId", authMiddleware, transportLogController.deleteLogController);

module.exports = router;
