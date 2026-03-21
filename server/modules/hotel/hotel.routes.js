const express = require("express");
const { getHotelsController, getHotelByIdController } = require("./hotel.controller");

const router = express.Router();

router.get("/", getHotelsController);
router.get("/:id", getHotelByIdController);

module.exports = router;
