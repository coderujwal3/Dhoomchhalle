const transportService = require("./transport.service");
const { responseFormatter } = require("../../utils/responseFormatter");

function resolveStatusCode(error) {
  if (error?.code === 11000) return 409;
  if (error?.name === "ValidationError") return 422;
  if (error?.message?.toLowerCase().includes("not found")) return 404;
  return 500;
}

async function getTransportTypesController(_req, res) {
  try {
    const types = await transportService.getTransportTypes();
    return res
      .status(200)
      .json(responseFormatter(true, "Transport types fetched", types, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function getTransportPricesController(req, res) {
  try {
    const payload = await transportService.listTransportPrices({
      page: req.query.page,
      limit: req.query.limit,
      source: req.query.source,
      destination: req.query.destination,
      transportType: req.query.transportType,
    });
    return res
      .status(200)
      .json(responseFormatter(true, "Transport prices fetched", payload, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function createTransportPriceController(req, res) {
  try {
    const price = await transportService.createTransportPrice(req.body);
    return res
      .status(201)
      .json(responseFormatter(true, "Transport price created", price, 201));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function updateTransportPriceController(req, res) {
  try {
    const price = await transportService.updateTransportPrice(
      req.params.priceId,
      req.body
    );
    if (!price) {
      return res
        .status(404)
        .json(responseFormatter(false, "Transport price not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Transport price updated", price, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function deleteTransportPriceController(req, res) {
  try {
    const price = await transportService.deleteTransportPrice(req.params.priceId);
    if (!price) {
      return res
        .status(404)
        .json(responseFormatter(false, "Transport price not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Transport price deleted", price, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function createTransportReportController(req, res) {
  try {
    const report = await transportService.createTransportReport({
      ...req.body,
      userId: req.user?._id || null,
    });
    return res
      .status(201)
      .json(responseFormatter(true, "Transport report submitted", report, 201));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function getTransportReportsController(req, res) {
  try {
    const reports = await transportService.listTransportReports({
      page: req.query.page,
      limit: req.query.limit,
      userId: req.query.onlyMine === "true" ? req.user?._id : null,
    });
    return res
      .status(200)
      .json(responseFormatter(true, "Transport reports fetched", reports, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

module.exports = {
  getTransportTypesController,
  getTransportPricesController,
  createTransportPriceController,
  updateTransportPriceController,
  deleteTransportPriceController,
  createTransportReportController,
  getTransportReportsController,
};
