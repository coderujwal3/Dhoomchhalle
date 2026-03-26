const express = require("express");
const router = express.Router();

const reviewController = require("./review.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const {
    createReviewValidation,
    updateReviewValidation,
} = require("./review.validation");

/**
 * Public routes
 */
router.get("/hotel/:hotelId", reviewController.getHotelReviewsController);
router.get("/hotel/:hotelId/average-rating", reviewController.getHotelAverageRatingController);
router.get("/:reviewId", reviewController.getReviewController);

/**
 * Protected routes (require authentication)
 */
router.post("/", authMiddleware, createReviewValidation, validateRequest, reviewController.createReviewController);
router.get("/me/reviews", authMiddleware, reviewController.getMyReviewsController);
router.put("/:reviewId", authMiddleware, updateReviewValidation, validateRequest, reviewController.updateReviewController);
router.delete("/:reviewId", authMiddleware, reviewController.deleteReviewController);
router.post("/:reviewId/helpful", reviewController.markReviewHelpfulController);

module.exports = router;
