const reviewService = require("./review.service");
const { responseFormatter } = require("../../utils/responseFormatter");

/**
 * POST /api/v1/reviews
 * Create a new review
 * Protected route
 */
async function createReviewController(req, res) {
    try {
        const { hotelId, rating, title, comment, visitDate, images } = req.body;
        const userId = req.user._id;

        const reviewData = {
            hotelId,
            userId,
            rating,
            title,
            comment,
            visitDate,
            images: images || [],
        };

        const review = await reviewService.createReview(reviewData);

        return res.status(201).json(responseFormatter(true, "Review created successfully", review, 201));
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/reviews/me
 * Get authenticated user's reviews
 * Protected route
 */
async function getMyReviewsController(req, res) {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await reviewService.getUserReviews(userId, page, limit);

        return res.status(200).json(responseFormatter(true, "User reviews fetched successfully", result, 200));
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/reviews/:reviewId
 * Get a single review by ID
 */
async function getReviewController(req, res) {
    try {
        const { reviewId } = req.params;

        const review = await reviewService.getReviewById(reviewId);

        if (!review) {
            return res.status(404).json(responseFormatter(false, "Review not found", null, 404));
        }

        return res.status(200).json(responseFormatter(true, "Review fetched successfully", review, 200));
    } catch (error) {
        console.error("Error fetching review:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/reviews/hotel/:hotelId
 * Get all reviews for a specific hotel
 */
async function getHotelReviewsController(req, res) {
    try {
        const { hotelId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await reviewService.getHotelReviews(hotelId, page, limit);

        return res.status(200).json(responseFormatter(true, "Hotel reviews fetched successfully", result, 200));
    } catch (error) {
        console.error("Error fetching hotel reviews:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * PUT /api/v1/reviews/:reviewId
 * Update a review
 * Protected route - only review owner can update
 */
async function updateReviewController(req, res) {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        // Check authorization - user can only update their own review
        const review = await reviewService.getReviewById(reviewId);

        if (!review) {
            return res.status(404).json(responseFormatter(false, "Review not found", null, 404));
        }

        if (review.userId._id.toString() !== userId.toString()) {
            return res.status(403).json(responseFormatter(false, "Not authorized to update this review", null, 403));
        }

        // Prevent updating userId and hotelId
        delete updateData.userId;
        delete updateData.hotelId;

        const updatedReview = await reviewService.updateReview(reviewId, updateData);

        return res.status(200).json(responseFormatter(true, "Review updated successfully", updatedReview, 200));
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * DELETE /api/v1/reviews/:reviewId
 * Delete a review
 * Protected route - only review owner or admin can delete
 */
async function deleteReviewController(req, res) {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await reviewService.getReviewById(reviewId);

        if (!review) {
            return res.status(404).json(responseFormatter(false, "Review not found", null, 404));
        }

        if (review.userId._id.toString() !== userId.toString() && req.user.role !== "admin") {
            return res.status(403).json(responseFormatter(false, "Not authorized to delete this review", null, 403));
        }

        await reviewService.deleteReview(reviewId);

        return res.status(200).json(responseFormatter(true, "Review deleted successfully", null, 200));
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/reviews/hotel/:hotelId/average-rating
 * Get average rating for a hotel
 */
async function getHotelAverageRatingController(req, res) {
    try {
        const { hotelId } = req.params;

        const result = await reviewService.getHotelAverageRating(hotelId);

        return res.status(200).json(responseFormatter(true, "Average rating fetched successfully", result, 200));
    } catch (error) {
        console.error("Error fetching average rating:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * POST /api/v1/reviews/:reviewId/helpful
 * Mark a review as helpful
 */
async function markReviewHelpfulController(req, res) {
    try {
        const { reviewId } = req.params;

        const result = await reviewService.markReviewHelpful(reviewId);

        return res.status(200).json(responseFormatter(true, "Review marked as helpful", result, 200));
    } catch (error) {
        console.error("Error marking review as helpful:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

module.exports = {
    createReviewController,
    getMyReviewsController,
    getReviewController,
    getHotelReviewsController,
    updateReviewController,
    deleteReviewController,
    getHotelAverageRatingController,
    markReviewHelpfulController,
};
