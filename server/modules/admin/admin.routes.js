const express = require('express');
const router = express.Router();
const { authSystemUserMiddleware } = require('../../middlewares/auth.middleware');
const adminController = require('./admin.controller');

// Dashboard Statistics
router.get('/dashboard/stats', authSystemUserMiddleware, adminController.getDashboardStats);
router.get('/dashboard/activities', authSystemUserMiddleware, adminController.getRecentActivities);
router.get('/dashboard/revenue', authSystemUserMiddleware, adminController.getRevenueStats);

// User Management
router.get('/users', authSystemUserMiddleware, adminController.getAllUsers);
router.get('/users/:userId', authSystemUserMiddleware, adminController.getUserDetails);
router.put('/users/:userId/role', authSystemUserMiddleware, adminController.updateUserRole);
router.delete('/users/:userId', authSystemUserMiddleware, adminController.deleteUser);
router.post('/users/:userId/suspend', authSystemUserMiddleware, adminController.suspendUser);
router.post('/users/:userId/activate', authSystemUserMiddleware, adminController.activateUser);

// Analytics
router.get('/analytics/users', authSystemUserMiddleware, adminController.getUserAnalytics);
router.get('/analytics/hotels', authSystemUserMiddleware, adminController.getHotelAnalytics);
router.get('/analytics/bookings', authSystemUserMiddleware, adminController.getBookingAnalytics);
router.get('/analytics/reports', authSystemUserMiddleware, adminController.getReportsAnalytics);

// Content Moderation
router.get('/reviews/pending', authSystemUserMiddleware, adminController.getPendingReviews);
router.post('/reviews/:reviewId/approve', authSystemUserMiddleware, adminController.approveReview);
router.post('/reviews/:reviewId/reject', authSystemUserMiddleware, adminController.rejectReview);

// Reports Management
router.get('/reports', authSystemUserMiddleware, adminController.getAllReports);
router.post('/reports/:reportId/resolve', authSystemUserMiddleware, adminController.resolveReport);

// Settings
router.get('/settings', authSystemUserMiddleware, adminController.getSettings);
router.put('/settings', authSystemUserMiddleware, adminController.updateSettings);

module.exports = router;
