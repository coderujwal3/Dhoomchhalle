const express = require("express");
const { authSystemUserMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const routeController = require("./route.controller");
const {
  listRoutesValidation,
  createRouteValidation,
  routeIdValidation,
  updateRouteValidation,
} = require("./route.validation");

const router = express.Router();

router.get("/", listRoutesValidation, validateRequest, routeController.listRoutesController);
router.get(
  "/:routeId",
  routeIdValidation,
  validateRequest,
  routeController.getRouteByIdController
);
router.post(
  "/",
  authSystemUserMiddleware,
  createRouteValidation,
  validateRequest,
  routeController.createRouteController
);
router.put(
  "/:routeId",
  authSystemUserMiddleware,
  updateRouteValidation,
  validateRequest,
  routeController.updateRouteController
);
router.delete(
  "/:routeId",
  authSystemUserMiddleware,
  routeIdValidation,
  validateRequest,
  routeController.deleteRouteController
);

module.exports = router;
