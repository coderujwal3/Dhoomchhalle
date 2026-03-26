const express = require("express");
const router = express.Router();
const reportController = require("./report.controller");
const { authMiddleware, authSystemUserMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
  createReportValidation,
  updateReportStatusValidation,
} = require("./report.validation");

router.post(
  "/",
  authMiddleware,
  createReportValidation,
  validateRequest,
  reportController.createReportController
);
router.get("/me", authMiddleware, reportController.getMyReportsController);
router.get("/admin/all", authSystemUserMiddleware, reportController.getAllReportsController);
router.put(
  "/:reportId",
  authSystemUserMiddleware,
  updateReportStatusValidation,
  validateRequest,
  reportController.updateReportStatusController
);

module.exports = router;
