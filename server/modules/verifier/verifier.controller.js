const reviewModel = require('../review/review.model');
const mongoose = require('mongoose');

/**
 * Get dashboard statistics for verifier
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const pendingCount = await reviewModel.countDocuments({ status: 'pending' });
        const approvedCount = await reviewModel.countDocuments({ status: 'approved' });
        const rejectedCount = await reviewModel.countDocuments({ status: 'rejected' });
        const totalReviews = await reviewModel.countDocuments({});

        const approvalRate = totalReviews > 0 ? ((approvedCount / totalReviews) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved",
            data: {
                stats: {
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount,
                    total: totalReviews,
                    approvalRate: parseFloat(approvalRate)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard stats",
            error: error.message
        });
    }
};

/**
 * Get pending reviews with pagination
 */
exports.getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, sort = 'newest' } = req.query;
        const skip = (page - 1) * limit;

        let query = { status: 'pending' };

        // Search by hotel name or reviewer name
        if (search && search.trim()) {
            const safeSearch = search.trim();
            query.$or = [
                { 'hotelId.name': { $regex: safeSearch, $options: 'i' } },
                { title: { $regex: safeSearch, $options: 'i' } },
                { comment: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        // Determine sort order
        let sortObj = { createdAt: -1 };
        if (sort === 'oldest') {
            sortObj = { createdAt: 1 };
        } else if (sort === 'rating_high') {
            sortObj = { rating: -1 };
        } else if (sort === 'rating_low') {
            sortObj = { rating: 1 };
        }

        const total = await reviewModel.countDocuments(query);
        const reviews = await reviewModel.find(query)
            .populate('userId', 'name email')
            .populate('hotelId', 'name location category')
            .skip(skip)
            .limit(limit)
            .sort(sortObj);

        res.status(200).json({
            success: true,
            message: "Pending reviews retrieved",
            data: {
                reviews,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching pending reviews",
            error: error.message
        });
    }
};

/**
 * Get count of pending reviews
 */
exports.getPendingReviewsCount = async (req, res) => {
    try {
        const count = await reviewModel.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            message: "Pending reviews count retrieved",
            data: { count }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching pending reviews count",
            error: error.message
        });
    }
};

/**
 * Get approved reviews with pagination
 */
exports.getApprovedReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const total = await reviewModel.countDocuments({ status: 'approved' });
        const reviews = await reviewModel.find({ status: 'approved' })
            .populate('userId', 'name email')
            .populate('hotelId', 'name location')
            .populate('verifiedBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ verificationDate: -1 });

        res.status(200).json({
            success: true,
            message: "Approved reviews retrieved",
            data: {
                reviews,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching approved reviews",
            error: error.message
        });
    }
};

/**
 * Get rejected reviews with pagination
 */
exports.getRejectedReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const total = await reviewModel.countDocuments({ status: 'rejected' });
        const reviews = await reviewModel.find({ status: 'rejected' })
            .populate('userId', 'name email')
            .populate('hotelId', 'name location')
            .populate('verifiedBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ verificationDate: -1 });

        res.status(200).json({
            success: true,
            message: "Rejected reviews retrieved",
            data: {
                reviews,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rejected reviews",
            error: error.message
        });
    }
};

/**
 * Get review details
 */
exports.getReviewDetails = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await reviewModel.findById(reviewId)
            .populate('userId', 'name email phone')
            .populate('hotelId', 'name location category rating')
            .populate('verifiedBy', 'name email');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review details retrieved",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching review details",
            error: error.message
        });
    }
};

/**
 * Approve review
 */
exports.approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            {
                status: 'approved',
                verifiedBy: userId,
                verificationDate: new Date(),
                isVerified: true
            },
            { returnDocument: 'after' }
        ).populate('userId', 'name email').populate('hotelId', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review approved successfully",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error approving review",
            error: error.message
        });
    }
};

/**
 * Reject review
 */
exports.rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid review ID"
            });
        }

        const rejectionReason = typeof reason === 'string' ? reason.trim() : 'No reason provided';

        if (!rejectionReason || rejectionReason === '') {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            {
                status: 'rejected',
                rejectionReason,
                verifiedBy: userId,
                verificationDate: new Date(),
                isVerified: false
            },
            { returnDocument: 'after' }
        ).populate('userId', 'name email').populate('hotelId', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review rejected successfully",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error rejecting review",
            error: error.message
        });
    }
};
