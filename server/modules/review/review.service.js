const reviewModel = require("./review.model");

/**
 * Create a new review
 */
async function createReview(reviewData) {
    try {
        const review = await reviewModel.create(reviewData);
        return await review.populate([
            { path: "userId", select: "name email avatar" },
            { path: "hotelId", select: "name location" },
        ]);
    } catch (error) {
        throw new Error(`Error creating review: ${error.message}`);
    }
}

/**
 * Get all reviews for a hotel
 */
async function getHotelReviews(hotelId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const reviews = await reviewModel
            .find({ hotelId })
            .populate("userId", "name email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await reviewModel.countDocuments({ hotelId });

        return {
            reviews,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        throw new Error(`Error fetching hotel reviews: ${error.message}`);
    }
}

/**
 * Get all reviews by a user
 */
async function getUserReviews(userId, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const reviews = await reviewModel
            .find({ userId })
            .populate("hotelId", "name location images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await reviewModel.countDocuments({ userId });

        return {
            reviews,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        throw new Error(`Error fetching user reviews: ${error.message}`);
    }
}

/**
 * Get a single review by ID
 */
async function getReviewById(reviewId) {
    try {
        const review = await reviewModel.findById(reviewId).populate([
            { path: "userId", select: "name email avatar" },
            { path: "hotelId", select: "name location images" },
        ]);
        return review;
    } catch (error) {
        throw new Error(`Error fetching review: ${error.message}`);
    }
}

/**
 * Update a review
 */
async function updateReview(reviewId, updateData) {
    try {
        const review = await reviewModel
            .findByIdAndUpdate(reviewId, {updateData: {$eq: updateData}}, {
                new: true,
                runValidators: true,
            })
            .populate([
                { path: "userId", select: "name email avatar" },
                { path: "hotelId", select: "name location" },
            ]);

        if (!review) {
            throw new Error("Review not found");
        }

        return review;
    } catch (error) {
        throw new Error(`Error updating review: ${error.message}`);
    }
}

/**
 * Delete a review
 */
async function deleteReview(reviewId) {
    try {
        const result = await reviewModel.findByIdAndDelete(reviewId);
        if (!result) {
            throw new Error("Review not found");
        }
        return result;
    } catch (error) {
        throw new Error(`Error deleting review: ${error.message}`);
    }
}

/**
 * Get average rating for a hotel
 */
async function getHotelAverageRating(hotelId) {
    try {
        const result = await reviewModel.aggregate([
            { $match: { hotelId: require("mongoose").Types.ObjectId(hotelId) } },
            {
                $group: {
                    _id: "$hotelId",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        if (result.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        return result[0];
    } catch (error) {
        throw new Error(`Error calculating average rating: ${error.message}`);
    }
}

/**
 * Mark review as helpful
 */
async function markReviewHelpful(reviewId) {
    try {
        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        if (!review) {
            throw new Error("Review not found");
        }

        return review;
    } catch (error) {
        throw new Error(`Error marking review as helpful: ${error.message}`);
    }
}

module.exports = {
    createReview,
    getHotelReviews,
    getUserReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getHotelAverageRating,
    markReviewHelpful,
};
