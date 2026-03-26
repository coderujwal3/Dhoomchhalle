const favouriteService = require("./favourite.service");
const { responseFormatter } = require("../../utils/responseFormatter");

/**
 * POST /api/v1/favourites
 * Add a hotel to favorites
 * Protected route
 */
async function addFavouriteController(req, res) {
    try {
        const { hotelId } = req.body;
        const userId = req.user._id;

        if (!hotelId) {
            return res.status(400).json(responseFormatter(false, "Hotel ID is required", null, 400));
        }

        const favourite = await favouriteService.addFavourite(userId, hotelId);

        return res.status(201).json(responseFormatter(true, "Hotel added to favorites", favourite, 201));
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json(responseFormatter(false, "Hotel already in favorites", null, 409));
        }
        console.error("Error adding favourite:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * DELETE /api/v1/favourites/:hotelId
 * Remove a hotel from favorites
 * Protected route
 */
async function removeFavouriteController(req, res) {
    try {
        const { hotelId } = req.params;
        const userId = req.user._id;

        if (!hotelId) {
            return res.status(400).json(responseFormatter(false, "Hotel ID is required", null, 400));
        }

        await favouriteService.removeFavourite(userId, hotelId);

        return res.status(200).json(responseFormatter(true, "Hotel removed from favorites", null, 200));
    } catch (error) {
        console.error("Error removing favourite:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/favourites/me
 * Get user's favorite hotels
 * Protected route
 */
async function getMyFavouritesController(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await favouriteService.getUserFavourites(userId, page, limit);

        return res.status(200).json(responseFormatter(true, "User favorites fetched successfully", result, 200));
    } catch (error) {
        console.error("Error fetching user favorites:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/favourites/check/:hotelId
 * Check if a hotel is favorited by the user
 * Protected route
 */
async function checkFavouriteController(req, res) {
    try {
        const { hotelId } = req.params;
        const userId = req.user._id;

        if (!hotelId) {
            return res.status(400).json(responseFormatter(false, "Hotel ID is required", null, 400));
        }

        const isFavourited = await favouriteService.isFavourited(userId, hotelId);

        return res.status(200).json(
            responseFormatter(true, "Favourite status retrieved", { hotelId, isFavourited }, 200)
        );
    } catch (error) {
        console.error("Error checking favourite:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/favourites/count
 * Get count of user's favorites
 * Protected route
 */
async function getFavouriteCountController(req, res) {
    try {
        const userId = req.user._id;

        const count = await favouriteService.getFavouriteCount(userId);

        return res.status(200).json(responseFormatter(true, "Favourite count retrieved", { count }, 200));
    } catch (error) {
        console.error("Error getting favourite count:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

module.exports = {
    addFavouriteController,
    removeFavouriteController,
    getMyFavouritesController,
    checkFavouriteController,
    getFavouriteCountController,
};
