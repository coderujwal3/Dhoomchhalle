const express = require("express");
const router = express.Router();

const favouriteController = require("./favourite.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const { addFavouriteValidation } = require("./favourite.validation");

/**
 * Protected routes (require authentication)
 */
router.post("/", authMiddleware, addFavouriteValidation, validateRequest, favouriteController.addFavouriteController);
router.delete("/:hotelId", authMiddleware, favouriteController.removeFavouriteController);
router.get("/me", authMiddleware, favouriteController.getMyFavouritesController);
router.get("/check/:hotelId", authMiddleware, favouriteController.checkFavouriteController);
router.get("/count", authMiddleware, favouriteController.getFavouriteCountController);

module.exports = router;
