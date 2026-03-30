const userModel = require('../user/user.model');
const hotelModel = require('../hotel/hotel.model');
const reviewModel = require('../review/review.model');
const reportModel = require('../report/report.model');
const transportLogModel = require('../transportLog/transportLog.model');

const REPORT_OPEN_STATUSES = ['open', 'in-review'];

function buildAdminReportQuery(status) {
    if (!status) {
        return {};
    }

    if (status === 'resolved') {
        return { status: 'resolved' };
    }

    if (status === 'unresolved') {
        return { status: { $in: REPORT_OPEN_STATUSES } };
    }

    return { status };
}

function formatReportForAdmin(report) {
    const reportObject = report.toObject ? report.toObject() : report;

    return {
        ...reportObject,
        reason: reportObject.category,
        reportedBy: reportObject.userId?.name || reportObject.userId?.email || "Unknown",
        resolved: reportObject.status === 'resolved',
        resolution: reportObject.adminNotes || "",
        contentType: reportObject.entityType,
        contentId: reportObject.entityId,
    };
}

// ============== DASHBOARD STATISTICS ==============
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const adminCount = await userModel.countDocuments({ role: 'admin' });
        const travellerCount = await userModel.countDocuments({ role: 'traveller' });
        const verifierCount = await userModel.countDocuments({ role: 'verifier' });

        const totalHotels = await hotelModel.countDocuments();
        const verifiedHotels = await hotelModel.countDocuments({ verified: true });

        const totalReviews = await reviewModel.countDocuments();
        const pendingReviews = await reviewModel.countDocuments({ status: 'pending' });

        const totalReports = await reportModel.countDocuments();
        const unresolvedReports = await reportModel.countDocuments({ status: { $in: REPORT_OPEN_STATUSES } });

        const stats = {
            users: {
                total: totalUsers,
                admins: adminCount,
                travellers: travellerCount,
                verifiers: verifierCount
            },
            hotels: {
                total: totalHotels,
                verified: verifiedHotels
            },
            content: {
                reviews: totalReviews,
                pendingReviews: pendingReviews
            },
            reports: {
                total: totalReports,
                unresolved: unresolvedReports
            }
        };

        res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved successfully",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard stats",
            error: error.message
        });
    }
};

exports.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get recent users
        const recentUsers = await userModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name email role createdAt');

        // Get recent hotels
        const recentHotels = await hotelModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name createdAt verified');

        // Get recent reviews
        const recentReviews = await reviewModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('hotelId rating createdAt status');

        const activities = {
            users: recentUsers,
            hotels: recentHotels,
            reviews: recentReviews
        };

        res.status(200).json({
            success: true,
            message: "Recent activities retrieved",
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching activities",
            error: error.message
        });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let dateFilter = new Date();
        if (period === 'week') {
            dateFilter.setDate(dateFilter.getDate() - 7);
        } else if (period === 'month') {
            dateFilter.setMonth(dateFilter.getMonth() - 1);
        } else if (period === 'year') {
            dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        }

        const transportLogs = await transportLogModel.find({
            createdAt: { $gte: dateFilter }
        });

        const totalRevenue = transportLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
        const avgRevenue = transportLogs.length > 0 ? totalRevenue / transportLogs.length : 0;

        res.status(200).json({
            success: true,
            message: "Revenue stats retrieved",
            data: {
                totalRevenue,
                avgRevenue,
                transactionCount: transportLogs.length,
                period
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching revenue stats",
            error: error.message
        });
    }
};

// ============== USER MANAGEMENT ==============
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role = null, search = '' } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await userModel.countDocuments(query);
        const users = await userModel.find(query)
            .skip(skip)
            .limit(limit)
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: {
                users,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User details retrieved",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user details",
            error: error.message
        });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'traveller', 'verifier'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        if (req.user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Cannot modify your own role"
            });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { role },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user role",
            error: error.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user._id.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete yourself"
            });
        }

        const user = await userModel.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

exports.suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                suspended: true,
                suspensionReason: reason || 'No reason provided',
                suspendedAt: new Date()
            },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "User suspended successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error suspending user",
            error: error.message
        });
    }
};

exports.activateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findByIdAndUpdate(
            userId,
            {
                suspended: false,
                suspensionReason: null,
                suspendedAt: null
            },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "User activated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error activating user",
            error: error.message
        });
    }
};

// ============== ANALYTICS ==============
exports.getUserAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);

        const dailyData = [];
        for (let i = days; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const count = await userModel.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            dailyData.push({
                date: startDate.toISOString().split('T')[0],
                users: count
            });
        }

        res.status(200).json({
            success: true,
            message: "User analytics retrieved",
            data: {
                dailyData,
                summary: {
                    total: await userModel.countDocuments(),
                    newUsers: await userModel.countDocuments({ createdAt: { $gte: dateFilter } })
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user analytics",
            error: error.message
        });
    }
};

exports.getHotelAnalytics = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);

        const dailyData = [];
        for (let i = days; i >= 0; i--) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const count = await hotelModel.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            dailyData.push({
                date: startDate.toISOString().split('T')[0],
                hotels: count
            });
        }

        res.status(200).json({
            success: true,
            message: "Hotel analytics retrieved",
            data: {
                dailyData,
                summary: {
                    total: await hotelModel.countDocuments(),
                    newHotels: await hotelModel.countDocuments({ createdAt: { $gte: dateFilter } }),
                    verified: await hotelModel.countDocuments({ verified: true })
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching hotel analytics",
            error: error.message
        });
    }
};

exports.getBookingAnalytics = async (req, res) => {
    try {
        const stats = {
            totalBookings: await transportLogModel.countDocuments(),
            totalRevenue: 0,
            averageRating: 0
        };

        const logs = await transportLogModel.find();
        stats.totalRevenue = logs.reduce((sum, log) => sum + (log.amount || 0), 0);

        res.status(200).json({
            success: true,
            message: "Booking analytics retrieved",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching booking analytics",
            error: error.message
        });
    }
};

exports.getReportsAnalytics = async (req, res) => {
    try {
        const stats = {
            total: await reportModel.countDocuments(),
            resolved: await reportModel.countDocuments({ status: 'resolved' }),
            unresolved: await reportModel.countDocuments({ status: { $in: REPORT_OPEN_STATUSES } })
        };

        stats.resolutionRate = stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Reports analytics retrieved",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reports analytics",
            error: error.message
        });
    }
};

// ============== CONTENT MODERATION ==============
exports.getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const total = await reviewModel.countDocuments({ status: 'pending' });
        const reviews = await reviewModel.find({ status: 'pending' })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Pending reviews retrieved",
            data: {
                reviews,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page
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

exports.approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            { status: 'approved' },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            message: "Review approved",
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

exports.rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            { status: 'rejected', rejectionReason: reason },
            { returnDocument: 'after' }
        );

        res.status(200).json({
            success: true,
            message: "Review rejected",
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

// ============== REPORTS MANAGEMENT ==============
exports.getAllReports = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = null } = req.query;
        const skip = (page - 1) * limit;

        const query = buildAdminReportQuery(status);

        const total = await reportModel.countDocuments(query);
        const reports = await reportModel.find(query)
            .populate('userId', 'name email')
            .populate('resolvedBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const formattedReports = reports.map(formatReportForAdmin);

        res.status(200).json({
            success: true,
            message: "Reports retrieved",
            data: {
                reports: formattedReports,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    currentPage: page
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reports",
            error: error.message
        });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { resolution } = req.body;

        const report = await reportModel.findByIdAndUpdate(
            reportId,
            {
                status: 'resolved',
                adminNotes: resolution,
                resolvedAt: new Date(),
                resolvedBy: req.user._id,
            },
            { returnDocument: 'after' }
        )
            .populate('userId', 'name email')
            .populate('resolvedBy', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Report resolved",
            data: formatReportForAdmin(report)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error resolving report",
            error: error.message
        });
    }
};

// ============== SETTINGS ==============
exports.getSettings = async (req, res) => {
    try {
        const settings = {
            siteName: "DhoomChhalle",
            maintenanceMode: false,
            emailNotifications: true,
            multiLanguage: false,
            features: {
                socialLogin: true,
                twoFactorAuth: false,
                advancedAnalytics: true
            }
        };

        res.status(200).json({
            success: true,
            message: "Settings retrieved",
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching settings",
            error: error.message
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;

        // Here you would update settings in database if you have a settings collection
        // For now, returning the successful update response

        res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating settings",
            error: error.message
        });
    }
};
