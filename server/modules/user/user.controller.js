const mongoose = require('mongoose');
const userModel = require('./user.model')
const otpModel = require('./otp.model');
const refreshTokenModel = require('./refreshToken.model');
const loginActivityModel = require('./loginActivity.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tokenBlacklistModel = require('../user/tokenBlacklist.model');
const emailService = require('../../services/email.service');
const { generateOTP, hashOTP, verifyOTP } = require('../../utils/otp.utils');
const { generateAccessToken, generateRefreshToken } = require('../../utils/token.utils');

const publicUserFields = ["_id", "name", "email", "phone", "role", "createdAt"];
const OTP_PURPOSES = {
    LOGIN: "login",
    ENABLE_2FA: "enable_2fa",
};
const OTP_EXPIRY_MS = 10 * 60 * 1000;

function sanitizePublicUser(user) {
    if (!user) {
        return null;
    }

    return publicUserFields.reduce((acc, field) => {
        acc[field] = user[field];
        return acc;
    }, {});
}

function buildOTPSessionToken(userId, purpose) {
    return jwt.sign(
        {
            userId: userId.toString(),
            purpose,
            type: "otp_session",
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "10m" }
    );
}

function decodeOTPSessionToken(otpSessionToken) {
    const decoded = jwt.verify(otpSessionToken, process.env.JWT_SECRET_KEY);

    if (decoded?.type !== "otp_session" || !Object.values(OTP_PURPOSES).includes(decoded?.purpose)) {
        throw new Error("Invalid OTP session");
    }

    return decoded;
}

async function getAuthenticatedUserFromRequest(req) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
        return null;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return userModel.findById(decodedToken.userId);
}

async function issueOTPForUser(user, purpose) {
    console.info("[2FA] Issuing OTP session", {
        userId: user?._id?.toString(),
        email: user?.email,
        purpose,
    });

    await otpModel.deleteMany({ userId: user._id, purpose });

    const plainOTP = generateOTP();
    const hashedOTP = await hashOTP(plainOTP);

    await otpModel.create({
        userId: user._id,
        otp: hashedOTP,
        purpose,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    });

    const emailSent = await emailService.sendOTPEmail(user.email, user.name, plainOTP);

    if (!emailSent) {
        await otpModel.deleteMany({ userId: user._id, purpose });
        throw new Error("OTP_EMAIL_FAILED");
    }

    return {
        otpSessionToken: buildOTPSessionToken(user._id, purpose),
    };
}

async function resolveOTPContext(req) {
    const { otpSessionToken, purpose: requestPurpose } = req.body || {};
    const authenticatedUser = await getAuthenticatedUserFromRequest(req);
    const authenticatedUserId = authenticatedUser?._id?.toString() || null;

    if (otpSessionToken) {
        const decoded = decodeOTPSessionToken(otpSessionToken);
        const user = await userModel.findById(decoded.userId);

        console.info("[2FA] Resolved OTP session token", {
            requestPurpose: requestPurpose || null,
            decodedPurpose: decoded.purpose,
            otpUserId: decoded.userId,
            authenticatedUserId,
        });

        if (requestPurpose && decoded.purpose !== requestPurpose) {
            console.warn("[2FA] OTP purpose mismatch detected", {
                requestPurpose,
                decodedPurpose: decoded.purpose,
                otpUserId: decoded.userId,
                authenticatedUserId,
            });

            if (
                requestPurpose === OTP_PURPOSES.ENABLE_2FA &&
                authenticatedUserId &&
                authenticatedUserId === decoded.userId
            ) {
                return {
                    user: authenticatedUser,
                    purpose: requestPurpose,
                    source: "authenticated_enable_2fa_fallback",
                };
            }

            throw new Error("OTP_PURPOSE_MISMATCH");
        }

        return {
            user,
            purpose: decoded.purpose,
            source: "otp_session",
        };
    }

    if (!authenticatedUser) {
        return {
            user: null,
            purpose: requestPurpose || OTP_PURPOSES.ENABLE_2FA,
            source: "missing_auth_context",
        };
    }

    return {
        user: authenticatedUser,
        purpose: requestPurpose || OTP_PURPOSES.ENABLE_2FA,
        source: "authenticated_request",
    };
}

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

/**
 * Helper: Get client IP from request
 */
function getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
}

/**
 * Helper: Get user agent from request
 */
function getUserAgent(req) {
    return req.get('user-agent') || 'unknown';
}

/**
 * Helper: Create login activity log
 */
async function logLoginActivity(userId, email, status, req, twoFactorAuthenticated = false, reason = null) {
    try {
        await loginActivityModel.create({
            userId,
            email,
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
            status,
            reason,
            twoFactorAuthenticated,
            loginTime: new Date(),
        });
    } catch (error) {
        console.log("Failed to log login activity:", error.message);
    }
}


/**
* - user register controller
* - POST api/auth/register 
*/
async function userRegisterController(req, res) {
    try {
        const { email, name, password, phone } = req.body;

        const isExists = await userModel.findOne({
            email: { $eq: email }
        })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: "failed"
            })
        }

        const user = await userModel.create({
            email,
            name,
            password,
            phone,
            role: "traveller",
        })

        const accessToken = generateAccessToken(user._id);
        res.cookie("token", accessToken, cookieOptions)

        res.status(201).json({
            status: "success",
            message: "Registration successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt,
                },
                token: accessToken
            }
        })

        try {
            await emailService.sendRegistrationEmail(user.email, user.name)
        } catch (emailError) {
            console.log("Registration email could not be sent:", emailError.message);
        }
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to register user right now"
        })
    }
}


/**
* - user login controller (Step 1: Email & Password validation)
* - POST api/auth/login 
*/
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email: { $eq: email } }).select("+password");
        if (!user) {
            await logLoginActivity(null, email, "failed", req, false, "Invalid email or password");
            return res.status(401).json({
                message: "Invalid email or password",
                status: "failed"
            })
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            await logLoginActivity(user._id, email, "failed", req, false, "Invalid password");
            return res.status(401).json({
                message: "Invalid email or password",
                status: "failed"
            })
        }

        if (user.suspended) {
            await logLoginActivity(user._id, email, "failed", req, false, "Account suspended");
            return res.status(403).json({
                message: "Your account has been suspended. Please contact support.",
                status: "failed",
            });
        }

        // If 2FA is enabled, send OTP and return OTP pending status
        if (user.twoFactorEnabled) {
            const otpSession = await issueOTPForUser(user, OTP_PURPOSES.LOGIN);

            await logLoginActivity(user._id, email, "otp_pending", req, false);

            return res.status(200).json({
                status: "success",
                message: "Check your email for 2FA code",
                data: {
                    requiresOTP: true,
                    otpSessionToken: otpSession.otpSessionToken,
                }
            });
        }

        // 2FA not enabled, generate tokens directly
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        await refreshTokenModel.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        // Update last login info
        user.lastLoginAt = new Date();
        user.lastLoginIp = getClientIP(req);
        await user.save();

        res.cookie("token", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        await logLoginActivity(user._id, email, "success", req, false);

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
                accessToken,
                refreshToken,
            }
        })
    } catch (error) {
        console.error("Login error:", error);

        if (error.message === "OTP_EMAIL_FAILED") {
            return res.status(502).json({
                status: "failed",
                message: "We could not send the OTP email right now. Please try again shortly."
            });
        }

        return res.status(500).json({
            status: "failed",
            message: "Unable to login right now"
        })
    }
}

/**
 * - Verify OTP and complete 2FA login
 * - POST api/auth/verify-otp
 */
async function verifyOTPController(req, res) {
    try {
        const { otp } = req.body;

        const { user, purpose, source } = await resolveOTPContext(req);
        console.info("[2FA] Verifying OTP", {
            userId: user?._id?.toString() || null,
            purpose,
            source,
            hasOtpSessionToken: Boolean(req.body?.otpSessionToken),
        });

        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        if (user.suspended) {
            return res.status(403).json({
                status: "failed",
                message: "Your account has been suspended. Please contact support.",
            });
        }

        // Find OTP record - check if expired
        const otpRecord = await otpModel.findOne({
            userId: user._id,
            purpose,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            console.warn("[2FA] OTP record not found", {
                userId: user._id.toString(),
                purpose,
                source,
            });
            await logLoginActivity(user._id, user.email, "failed", req, false, "OTP expired or not found");
            return res.status(400).json({
                status: "failed",
                message: "OTP expired or invalid. Please request a new one."
            });
        }

        // Increment attempts
        otpRecord.attempts += 1;
        if (otpRecord.attempts > 5) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            await logLoginActivity(user._id, user.email, "failed", req, false, "Max OTP attempts exceeded");
            return res.status(429).json({
                status: "failed",
                message: "Too many failed attempts. Please request a new OTP."
            });
        }

        // Verify OTP
        const isValidOTP = await verifyOTP(otp, otpRecord.otp);
        if (!isValidOTP) {
            await otpRecord.save();
            await logLoginActivity(user._id, user.email, "failed", req, false, `Invalid OTP - attempt ${otpRecord.attempts}/5`);
            return res.status(401).json({
                status: "failed",
                message: "Invalid OTP. Please try again.",
                attempts: otpRecord.attempts
            });
        }

        // OTP is valid - delete it and complete login
        await otpModel.deleteOne({ _id: otpRecord._id });

        if (purpose === OTP_PURPOSES.ENABLE_2FA) {
            console.info("[2FA] Enabling 2FA for user", {
                userId: user._id.toString(),
                email: user.email,
                source,
            });
            const updatedUser = await userModel.findByIdAndUpdate(
                user._id,
                { $set: { twoFactorEnabled: true } },
                { returnDocument: 'after' }
            );

            console.info("[2FA] 2FA enable persisted", {
                userId: user._id.toString(),
                twoFactorEnabled: updatedUser?.twoFactorEnabled ?? null,
            });

            if (!updatedUser) {
                return res.status(404).json({
                    status: "failed",
                    message: "User not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "2FA enabled successfully",
                data: {
                    twoFactorEnabled: updatedUser.twoFactorEnabled,
                }
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        await refreshTokenModel.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ipAddress: getClientIP(req),
            userAgent: getUserAgent(req),
        });

        // Update last login info
        user.lastLoginAt = new Date();
        user.lastLoginIp = getClientIP(req);
        await user.save();

        res.cookie("token", accessToken, cookieOptions);
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        await logLoginActivity(user._id, user.email, "otp_verified", req, true);

        res.status(200).json({
            status: "success",
            message: "2FA verification successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
                accessToken,
                refreshToken,
            }
        });
    } catch (error) {
        console.error("OTP verification error:", error);

        if (error.message === "OTP_PURPOSE_MISMATCH") {
            return res.status(400).json({
                status: "failed",
                message: "OTP session purpose mismatch. Please request a fresh code.",
            });
        }

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "failed",
                message: "OTP session has expired. Please log in again."
            });
        }

        return res.status(500).json({
            status: "failed",
            message: "Unable to verify OTP right now"
        });
    }
}

/**
 * - Resend OTP
 * - POST api/auth/resend-otp
 * - Can be called during login (unauthenticated) or settings (authenticated)
 */
async function resendOTPController(req, res) {
    try {
        const { user, purpose } = await resolveOTPContext(req);

        if (!user) {
            return res.status(400).json({
                status: "failed",
                message: "An active OTP session or authenticated user is required"
            });
        }

        if (purpose === OTP_PURPOSES.LOGIN && !user.twoFactorEnabled) {
            return res.status(400).json({
                status: "failed",
                message: "2FA is not enabled for this account"
            });
        }

        if (purpose === OTP_PURPOSES.ENABLE_2FA && user.twoFactorEnabled) {
            return res.status(409).json({
                status: "failed",
                message: "2FA is already enabled for this account"
            });
        }

        const otpSession = await issueOTPForUser(user, purpose);

        return res.status(200).json({
            status: "success",
            message: "OTP has been resent to your email",
            data: {
                otpSessionToken: otpSession.otpSessionToken,
            }
        });
    } catch (error) {
        console.error("Resend OTP error:", error);

        if (error.message === "OTP_EMAIL_FAILED") {
            return res.status(502).json({
                status: "failed",
                message: "We could not send the OTP email right now. Please try again shortly."
            });
        }

        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "failed",
                message: "OTP session has expired. Please log in again."
            });
        }

        return res.status(500).json({
            status: "failed",
            message: "Unable to resend OTP right now"
        });
    }
}

/**
 * - Refresh access token using refresh token
 * - POST api/auth/refresh-token
 */
async function refreshAccessTokenController(req, res) {
    try {
        const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                status: "failed",
                message: "Refresh token is required"
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        } catch (error) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid or expired refresh token"
            });
        }

        // Check if token exists in database and not revoked
        const refreshTokenRecord = await refreshTokenModel.findOne({
            token: refreshToken,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });

        if (!refreshTokenRecord) {
            return res.status(401).json({
                status: "failed",
                message: "Refresh token is invalid or revoked"
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(decoded.userId);

        res.cookie("token", newAccessToken, cookieOptions);

        return res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        console.error("Token refresh error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Unable to refresh token right now"
        });
    }
}

/**
 * - Enable 2FA for user
 * - POST api/auth/enable-2fa
 */
async function enable2FAController(req, res) {
    try {
        const user = req.user; // From auth middleware
        console.info("[2FA] Enable 2FA requested", {
            userId: user?._id?.toString(),
            email: user?.email,
            twoFactorEnabled: user?.twoFactorEnabled,
        });

        if (user.twoFactorEnabled) {
            return res.status(409).json({
                status: "failed",
                message: "2FA is already enabled for this account"
            });
        }

        const otpSession = await issueOTPForUser(user, OTP_PURPOSES.ENABLE_2FA);

        return res.status(200).json({
            status: "success",
            message: "Check your email for the verification code to enable 2FA",
            data: {
                requiresOTP: true,
                otpSessionToken: otpSession.otpSessionToken,
            }
        });
    } catch (error) {
        console.error("Enable 2FA error:", error);

        if (error.message === "OTP_EMAIL_FAILED") {
            return res.status(502).json({
                status: "failed",
                message: "We could not send the OTP email right now. Please try again shortly."
            });
        }

        return res.status(500).json({
            status: "failed",
            message: "Unable to enable 2FA right now"
        });
    }
}

/**
 * - Disable 2FA for user
 * - POST api/auth/disable-2fa
 */
async function disable2FAController(req, res) {
    try {
        const userId = req.user._id;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: { twoFactorEnabled: false } },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        // Delete any pending OTPs
        await otpModel.deleteMany({ userId });

        return res.status(200).json({
            status: "success",
            message: "2FA has been disabled for your account",
            data: {
                twoFactorEnabled: updatedUser.twoFactorEnabled,
            }
        });
    } catch (error) {
        console.error("Disable 2FA error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Unable to disable 2FA right now"
        });
    }
}

/**
 * GET /auth/me — requires authMiddleware (JWT valid + user exists in DB)
 */
async function getMeController(req, res) {
    const user = req.user;
    return res.status(200).json({
        status: "success",
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
        },
    });
}

/**
 * - Get login activity logs
 * - GET api/auth/login-activity
 */
async function getLoginActivityController(req, res) {
    try {
        const user = req.user;
        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const activities = await loginActivityModel
            .find({ userId: user._id })
            .sort({ loginTime: -1 })
            .limit(limit)
            .skip(skip);

        const total = await loginActivityModel.countDocuments({ userId: user._id });

        return res.status(200).json({
            status: "success",
            data: {
                activities,
                pagination: {
                    total,
                    limit,
                    skip,
                    pages: Math.ceil(total / limit),
                }
            }
        });
    } catch (error) {
        console.error("Get login activity error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Unable to fetch login activity"
        });
    }
}

/**
* - user logout controller
* - POST api/auth/logout 
*/
async function userLogoutController(req, res) {
    try {
        const user = req.user;
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        // Revoke refresh token if exists
        if (refreshToken) {
            await refreshTokenModel.updateOne(
                { token: refreshToken },
                { isRevoked: true, revokedAt: new Date() }
            );
        }

        res.cookie("token", "", { expires: new Date(0), httpOnly: true, sameSite: "lax" })
        res.cookie("refreshToken", "", { expires: new Date(0), httpOnly: true, sameSite: "lax" })

        return res.status(200).json({
            message: "User Logout Successfully",
            status: "success"
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to logout right now"
        })
    }
}

async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email: { $eq: email } });

        // Always return success to avoid account enumeration.
        if (!user) {
            return res.status(200).json({
                status: "success",
                message: "If this email exists, a reset link has been sent",
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        const baseClientUrl = process.env.CLIENT_ORIGIN || "http://localhost:5173";
        const resetLink = `${baseClientUrl}/reset-password/${rawToken}`;
        await emailService.sendPasswordResetEmail(user.email, user.name, resetLink);

        return res.status(200).json({
            status: "success",
            message: "If this email exists, a reset link has been sent",
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to process forgot password request right now",
        });
    }
}

async function resetPasswordController(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await userModel.findOne({
            resetPasswordToken: { $eq: hashedToken },
            resetPasswordExpires: { $gt: new Date() },
        }).select("+resetPasswordToken +resetPasswordExpires");

        if (!user) {
            return res.status(400).json({
                status: "failed",
                message: "Reset link is invalid or expired",
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Password reset successful. Please login with your new password.",
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to reset password right now",
        });
    }
}


/**
 * - Get users by their id for /user/:id api
 */
async function getUserByIdController(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid user id",
            });
        }

        const user = await userModel.findById(id).lean();
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        return res.status(200).json({
            status: "success",
            data: sanitizePublicUser(user),
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to fetch User details",
        });
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    verifyOTPController,
    resendOTPController,
    refreshAccessTokenController,
    enable2FAController,
    disable2FAController,
    userLogoutController,
    getMeController,
    getLoginActivityController,
    forgotPasswordController,
    resetPasswordController,
    getUserByIdController,
};
