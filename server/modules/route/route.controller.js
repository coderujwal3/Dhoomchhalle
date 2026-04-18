const routeService = require("./route.service");
const { responseFormatter } = require("../../utils/responseFormatter");

function resolveStatusCode(error) {
  if (error?.code === 11000) return 409;
  if (error?.name === "ValidationError") return 422;
  return 500;
}

async function listRoutesController(req, res) {
  try {
    const payload = await routeService.listRoutes({
      page: req.query.page,
      limit: req.query.limit,
      source: req.query.source,
      destination: req.query.destination,
      trafficStatus: req.query.trafficStatus,
      search: req.query.search,
    });

    return res
      .status(200)
      .json(responseFormatter(true, "Routes fetched successfully", payload, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function getRouteByIdController(req, res) {
  try {
    const route = await routeService.getRouteById(req.params.routeId);
    if (!route) {
      return res
        .status(404)
        .json(responseFormatter(false, "Route not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Route fetched successfully", route, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

async function createRouteController(req, res) {
  try {
    const route = await routeService.createRoute(req.body);
    return res
      .status(201)
      .json(responseFormatter(true, "Route created successfully", route, 201));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function updateRouteController(req, res) {
  try {
    const route = await routeService.updateRoute(req.params.routeId, req.body);
    if (!route) {
      return res
        .status(404)
        .json(responseFormatter(false, "Route not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Route updated successfully", route, 200));
  } catch (error) {
    const statusCode = resolveStatusCode(error);
    return res
      .status(statusCode)
      .json(responseFormatter(false, error.message, null, statusCode));
  }
}

async function deleteRouteController(req, res) {
  try {
    const deletedRoute = await routeService.deleteRoute(req.params.routeId);
    if (!deletedRoute) {
      return res
        .status(404)
        .json(responseFormatter(false, "Route not found", null, 404));
    }

    return res
      .status(200)
      .json(responseFormatter(true, "Route deleted successfully", deletedRoute, 200));
  } catch (error) {
    return res
      .status(500)
      .json(responseFormatter(false, error.message, null, 500));
  }
}

module.exports = {
  listRoutesController,
  getRouteByIdController,
  createRouteController,
  updateRouteController,
  deleteRouteController,
};
