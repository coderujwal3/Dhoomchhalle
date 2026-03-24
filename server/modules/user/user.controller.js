const mongoose = require('mongoose');
const userModel = require('./user.model')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const tokenBlacklistModel = require('../user/tokenBlacklist.model');
const emailService = require('../../services/email.service');

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
}


/**
* - user register controller
* - POST api/auth/register 
*/
async function userRegisterController(req, res) {
    try {
        const { email, name, password, phone } = req.body;
        const formattedPhone = `+91${phone}`;

        const isExists = await userModel.findOne({
            email: email
        })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with this email",
                status: "failed"
            })
        }

        const user = await userModel.create({
            email, name, password, phone: formattedPhone
        })

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
        res.cookie("token", token, cookieOptions)

        res.status(201).json({
            status: "success",
            message: "Registration successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: formattedPhone,
                }, token
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
* - user login controller
* - POST api/auth/login 
*/
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                status: "failed"
            })
        }
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid email or password",
                status: "failed"
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                }, token
            }
        })
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Unable to login right now"
        })
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
                createdAt: user.createdAt,
            },
        },
    });
}

/**
* - user logout controller
* - POST api/auth/logout 
*/
async function userLogoutController(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(200).json({
                message: "User Logout Successfully",
                status: "success"
            })
        }

        res.cookie("token", "", { expires: new Date(0), httpOnly: true, sameSite: "lax" })
        await tokenBlacklistModel.create({ token: token })
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
        const user = await userModel.findOne({ email });

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
            resetPasswordToken: hashedToken,
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
      data: user,
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
    userLogoutController,
    getMeController,
    forgotPasswordController,
    resetPasswordController,
    getUserByIdController,
};