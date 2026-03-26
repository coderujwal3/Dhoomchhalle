const favouriteModel = require("./favourite.model");

/**
 * Add a hotel to favorites
 */
async function addFavourite(userId, hotelId) {
    try {
        // Check if already favorited
        const existing = await favouriteModel.findOne({ userId, hotelId });
        if (existing) {
            return existing;
        }

        const favourite = await favouriteModel.create({
            userId,
            hotelId,
        });

        return await favourite.populate("hotelId");
    } catch (error) {
        throw new Error(`Error adding favourite: ${error.message}`);
    }
}

/**
 * Remove a hotel from favorites
 */
async function removeFavourite(userId, hotelId) {
    try {
        const result = await favouriteModel.deleteOne({
            userId,
            hotelId,
        });

        if (result.deletedCount === 0) {
            throw new Error("Favourite not found");
        }

        return result;
    } catch (error) {
        throw new Error(`Error removing favourite: ${error.message}`);
    }
}

/**
 * Get all favorites for a user
 */
async function getUserFavourites(userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const favourites = await favouriteModel
            .find({ userId })
            .populate("hotelId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await favouriteModel.countDocuments({ userId });

        return {
            favourites,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        throw new Error(`Error fetching user favourites: ${error.message}`);
    }
}

/**
 * Check if a hotel is favorited by a user
 */
async function isFavourited(userId, hotelId) {
    try {
        const favourite = await favouriteModel.findOne({
            userId,
            hotelId,
        });

        return !!favourite;
    } catch (error) {
        throw new Error(`Error checking favourite: ${error.message}`);
    }
}

/**
 * Get count of favorites for a user
 */
async function getFavouriteCount(userId) {
    try {
        const count = await favouriteModel.countDocuments({ userId });
        return count;
    } catch (error) {
        throw new Error(`Error getting favourite count: ${error.message}`);
    }
}

module.exports = {
    addFavourite,
    removeFavourite,
    getUserFavourites,
    isFavourited,
    getFavouriteCount,
};
