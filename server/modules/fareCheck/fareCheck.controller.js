const { responseFormatter } = require("../../utils/responseFormatter");
const fareCheckService = require("./fareCheck.service");

async function evaluateFareController(req, res) {
  try {
    const result = await fareCheckService.evaluateFareCheck({
      ...req.body,
      userId: req.user?._id || null,
    });

    return res
      .status(200)
      .json(
        responseFormatter(true, "Fare evaluated successfully", result, 200)
      );
  } catch (error) {
    return res
      .status(400)
      .json(responseFormatter(false, error.message, null, 400));
  }
}

async function reportFareController(req, res) {
  try {
    const result = await fareCheckService.reportFareCheck({
      ...req.body,
      userId: req.user?._id || null,
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Fare report submitted", result, 200));
  } catch (error) {
    const statusCode =
      error.message && error.message.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function getFareHotspotsController(req, res) {
  try {
    const hotspots = await fareCheckService.getFareRiskHotspots({
      limit: req.query.limit,
      days: req.query.days,
      minRisk: req.query.minRisk,
    });

    return res
      .status(200)
      .json(
        responseFormatter(
          true,
          "Fare risk hotspots fetched successfully",
          hotspots,
          200
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function getMyFareChecksController(req, res) {
  try {
    const history = await fareCheckService.getUserFareCheckHistory({
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
      riskLevel: req.query.riskLevel,
    });

    return res
      .status(200)
      .json(
        responseFormatter(
          true,
          "Fare check history fetched successfully",
          history,
          200
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function upsertHotspotActionController(req, res) {
  try {
    const action = await fareCheckService.upsertHotspotAction({
      ...req.body,
      updatedBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id,
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Hotspot action updated", action, 200));
  } catch (error) {
    const statusCode = error.message?.includes("not found") ? 404 : 400;
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

module.exports = {
  evaluateFareController,
  reportFareController,
  getFareHotspotsController,
  getMyFareChecksController,
  upsertHotspotActionController,
};
