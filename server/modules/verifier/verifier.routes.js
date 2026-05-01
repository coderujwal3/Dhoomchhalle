const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../../middlewares/roleBasedAccess.middleware');
const verifierController = require('./verifier.controller');

// Dashboard
router.get('/dashboard/stats', authorizeRole('admin', 'verifier'), verifierController.getDashboardStats);

// Pending Reviews
router.get('/reviews/pending', authorizeRole('admin', 'verifier'), verifierController.getPendingReviews);
router.get('/reviews/pending/count', authorizeRole('admin', 'verifier'), verifierController.getPendingReviewsCount);

// Approved Reviews
router.get('/reviews/approved', authorizeRole('admin', 'verifier'), verifierController.getApprovedReviews);

// Rejected Reviews
router.get('/reviews/rejected', authorizeRole('admin', 'verifier'), verifierController.getRejectedReviews);

// Review Details
router.get('/reviews/:reviewId', authorizeRole('admin', 'verifier'), verifierController.getReviewDetails);

// Approve Review
router.post('/reviews/:reviewId/approve', authorizeRole('admin', 'verifier'), verifierController.approveReview);

// Reject Review
router.post('/reviews/:reviewId/reject', authorizeRole('admin', 'verifier'), verifierController.rejectReview);

module.exports = router;
