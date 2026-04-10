const {
  calculateFare,
  computeAndRankRoute,
  getPlacesWithinBounds,
  getPopularRoutes,
  getTransports,
} = require("./map.service");

async function getPlacesController(req, res) {
  try {
    const { north, south, east, west, limit, types } = req.query;
    const places = await getPlacesWithinBounds({
      north: Number(north),
      south: Number(south),
      east: Number(east),
      west: Number(west),
      limit: Number(limit),
      types,
    });

    return res.status(200).json({
      status: "success",
      data: places,
      meta: {
        count: places.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to fetch places for selected bounds",
      error: error.message,
    });
  }
}

async function postRouteController(req, res) {
  try {
    const routeData = await computeAndRankRoute(req.body);

    return res.status(200).json({
      status: "success",
      data: routeData,
    });
  } catch (error) {
    const statusCode =
      error.name === "AbortError" || /OSRM|route/i.test(error.message) ? 502 : 400;

    return res.status(statusCode).json({
      status: "failed",
      message: "Unable to compute route",
      error: error.message,
    });
  }
}

async function postFareController(req, res) {
  try {
    const fare = await calculateFare(req.body);

    return res.status(200).json({
      status: "success",
      data: fare,
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: "Unable to calculate fare",
      error: error.message,
    });
  }
}

async function getPopularRoutesController(req, res) {
  try {
    const routes = await getPopularRoutes(req.query.limit);
    return res.status(200).json({
      status: "success",
      data: routes,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to fetch popular routes",
      error: error.message,
    });
  }
}

async function getTransportsController(req, res) {
  try {
    const transports = await getTransports();
    return res.status(200).json({
      status: "success",
      data: transports,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to fetch transports",
      error: error.message,
    });
  }
}

module.exports = {
  getPlacesController,
  postRouteController,
  postFareController,
  getPopularRoutesController,
  getTransportsController,
};
