const mongoose = require('mongoose')
const userModel = require('../modules/user/user.model')
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require('../modules/user/tokenBlacklist.model')


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }

    const isBkacklistedToken = await tokenBlacklistModel.findOne({ token })
    if (isBkacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, Token is Blacklisted"
        })
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY)
        // using the same data to show, which was saved when initializing the token in auth.controller.js (e.i, user._id)
        const user = await userModel.findById(decoded_token.userId)
        
        if (!user) {
            res.clearCookie("token", { httpOnly: true, sameSite: "lax", path: "/" });
            return res.status(401).json({
                message: "User no longer exists",
            });
        }
        req.user = user
        return next()
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }

    const isBkacklistedToken = await tokenBlacklistModel.findOne({ token })
    if (isBkacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, Token is Invalid"
        })
    }

    try {
        const decoded_token = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await userModel.findById(decoded_token.userId).select("+role");
        if (!user) {
            res.clearCookie("token", { httpOnly: true, sameSite: "lax", path: "/" });
            return res.status(401).json({
                message: "User no longer exists",
            });
        }
        if (!user.role.includes("admin")) {
            return res.status(403).json({
                message: "Forbidden Access, Unauthorized User"
            })
        }
        req.user = user
        return next()
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        })
    }
}



module.exports = { authMiddleware, authSystemUserMiddleware }