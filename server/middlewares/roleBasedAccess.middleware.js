const mongoose = require('mongoose');
const userModel = require('../modules/user/user.model');
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require('../modules/user/tokenBlacklist.model');

/**
 * Admin-only middleware with enhanced role checking
 * This is more strict than authSystemUserMiddleware
 */
async function adminOnlyMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Token is missing"
        });
    }

    const isBlacklistedToken = await tokenBlacklistModel.findOne({ token });
    if (isBlacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized: Token is blacklisted"
        });
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await userModel.findById(decoded_token.userId).select("+role");

        if (!user) {
            res.clearCookie("token", { httpOnly: true, sameSite: "lax", path: "/" });
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        // Check if user is suspended
        if (user.suspended) {
            return res.status(403).json({
                message: "User account is suspended",
                reason: user.suspensionReason
            });
        }

        // Strict admin check
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Forbidden: Admin access required only"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token"
        });
    }
}

/**
 * Role-based middleware factory
 * Usage: authorizeRole('admin', 'verifier')
 */
function authorizeRole(...allowedRoles) {
    return async (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: Token is missing"
            });
        }

        const isBlacklistedToken = await tokenBlacklistModel.findOne({ token });
        if (isBlacklistedToken) {
            return res.status(401).json({
                message: "Unauthorized: Token is blacklisted"
            });
        }

        try {
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await userModel.findById(decoded_token.userId).select("+role");

            if (!user) {
                res.clearCookie("token", { httpOnly: true, sameSite: "lax", path: "/" });
                return res.status(401).json({
                    message: "User no longer exists"
                });
            }

            // Check if user is suspended
            if (user.suspended) {
                return res.status(403).json({
                    message: "User account is suspended"
                });
            }

            // Check if user has required role
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: `Forbidden: Required roles are [${allowedRoles.join(', ')}]`,
                    userRole: user.role
                });
            }

            req.user = user;
            return next();
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized: Invalid token"
            });
        }
    };
}

/**
 * Permission-based middleware factory
 * Usage: authorize(['users.manage', 'content.moderate'])
 */
function authorize(requiredPermissions) {
    const rolePermissions = {
        super_admin: [
            'users.manage',
            'users.delete',
            'users.suspend',
            'users.create',
            'roles.assign',
            'content.moderate',
            'content.approve',
            'content.reject',
            'reports.view',
            'reports.resolve',
            'disputes.resolve',
            'hotels.manage',
            'hotels.delete',
            'transport.manage',
            'transport.delete',
            'analytics.view',
            'analytics.all',
            'finance.view',
            'finance.manage',
            'settings.manage',
            'audit.view',
            'compliance.full'
        ],
        admin: [
            'users.manage',
            'users.delete',
            'users.suspend',
            'content.moderate',
            'content.approve',
            'content.reject',
            'reports.view',
            'reports.resolve',
            'disputes.resolve',
            'hotels.manage',
            'hotels.delete',
            'transport.manage',
            'transport.delete',
            'analytics.view',
            'finance.view',
            'settings.manage',
            'audit.view',
            'compliance.full'
        ],
        verifier: [
            'content.moderate',
            'content.approve',
            'content.reject',
            'reports.view',
            'analytics.view'
        ],
        compliance_officer: [
            'reports.view',
            'reports.resolve',
            'disputes.resolve',
            'users.suspend',
            'analytics.view',
            'compliance.investigate',
            'audit.view'
        ],
        hotel_manager: [
            'hotels.manage_own',
            'bookings.view_own',
            'reviews.respond',
            'analytics.view_own',
            'inventory.manage'
        ],
        transport_provider: [
            'transport.manage_own',
            'transport.pricing',
            'bookings.view_own',
            'analytics.view_own',
            'scheduling.manage'
        ],
        traveller: [
            'bookings.view',
            'bookings.create',
            'reviews.write',
            'reviews.own_manage',
            'favorites.manage',
            'profile.view_own',
            'profile.edit_own'
        ]
    };

    return async (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: Token is missing"
            });
        }

        try {
            const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await userModel.findById(decoded_token.userId).select("+role");

            if (!user) {
                return res.status(401).json({
                    message: "User no longer exists"
                });
            }

            if (user.suspended) {
                return res.status(403).json({
                    message: "User account is suspended"
                });
            }

            const userPermissions = rolePermissions[user.role] || [];
            const hasPermission = requiredPermissions.every(perm =>
                userPermissions.includes(perm)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    message: "Forbidden: Insufficient permissions",
                    required: requiredPermissions,
                    userRole: user.role
                });
            }

            req.user = user;
            return next();
        } catch (error) {
            return res.status(401).json({
                message: "Unauthorized: Invalid token"
            });
        }
    };
}

/**
 * Rate limiting for admin operations
 */
function adminRateLimit(req, res, next) {
    // In production we will use Redis for this
    const ip = req.ip;
    const key = `admin_${ip}`;
    const limit = 100; // requests
    const window = 7 * 24 * 60 * 60 * 1000; // 7 days

    next();
}

module.exports = {
    adminOnlyMiddleware,
    authorizeRole,
    authorize,
    adminRateLimit
};
