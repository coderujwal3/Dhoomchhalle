const Hotel = require("./hotel.model");
const mongoose = require("mongoose");

async function getHotelsController(req, res) {
  try {
    const hotels = await Hotel.find({})
      .select("name location category pricePerNight amenities avgRating contactNumber photos")
      .sort({ createdAt: -1 })    // to get latest data on top
      .lean();

    return res.status(200).json({
      status: "success",
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to fetch hotels",
    });
  }
}

async function getHotelByIdController(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid hotel id",
      });
    }

    const hotel = await Hotel.findById(id).lean();
    if (!hotel) {
      return res.status(404).json({
        status: "failed",
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Unable to fetch hotel details",
    });
  }
}

module.exports = {
  getHotelsController,
  getHotelByIdController,
};
