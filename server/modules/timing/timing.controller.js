const timingService = require("./timing.service");
const { responseFormatter } = require("../../utils/responseFormatter");

function resolveStatusCode(error) {
  if (error?.name === "ValidationError") return 422;
  return 500;
}

async function listTimingsController(req, res) {
  try {
    const payload = await timingService.listTimings({
      page: req.query.page,
      limit: req.query.limit,
      transportType: req.query.transportType,
      routeName: req.query.routeName,
      stationName: req.query.stationName,
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Timings fetched successfully", payload, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function getTimingByIdController(req, res) {
  try {
    const timing = await timingService.getTimingById(req.params.timingId);
    if (!timing) {
      return res
        .status(404)
        .json(responseFormatter(false, "Timing not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Timing fetched successfully", timing, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function createTimingController(req, res) {
  try {
    const timing = await timingService.createTiming(req.body);
    return res
      .status(201)
      .json(responseFormatter(true, "Timing created successfully", timing, 201));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function updateTimingController(req, res) {
  try {
    const timing = await timingService.updateTiming(req.params.timingId, req.body);
    if (!timing) {
      return res
        .status(404)
        .json(responseFormatter(false, "Timing not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Timing updated successfully", timing, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function deleteTimingController(req, res) {
  try {
    const timing = await timingService.deleteTiming(req.params.timingId);
    if (!timing) {
      return res
        .status(404)
        .json(responseFormatter(false, "Timing not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Timing deleted successfully", timing, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

module.exports = {
  listTimingsController,
  getTimingByIdController,
  createTimingController,
  updateTimingController,
  deleteTimingController,
};
