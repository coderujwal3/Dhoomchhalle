const userModel = require("../modules/user/user.model");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../modules/user/tokenBlacklist.model");

const clearTokenCookie = (res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });
};

async function getAuthenticatedUser(token, includeRole = false) {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const query = userModel.findById(decodedToken.userId);

    if (includeRole) {
        query.select("+role");
    }

    return query;
}


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        });
    }

    const isBlacklistedToken = await tokenBlacklistModel.findOne({ token });
    if (isBlacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, Token is Blacklisted"
        });
    }

    try {
        const user = await getAuthenticatedUser(token);
        
        if (!user) {
            clearTokenCookie(res);
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        if (user.suspended) {
            clearTokenCookie(res);
            return res.status(403).json({
                message: "User account is suspended",
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        clearTokenCookie(res);
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is invalid"
        });
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is missing"
        });
    }

    const isBlacklistedToken = await tokenBlacklistModel.findOne({ token });
    if (isBlacklistedToken) {
        return res.status(401).json({
            message: "Unauthorized access, Token is Invalid"
        });
    }

    try {
        const user = await getAuthenticatedUser(token, true);

        if (!user) {
            clearTokenCookie(res);
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        if (user.suspended) {
            clearTokenCookie(res);
            return res.status(403).json({
                message: "User account is suspended",
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Forbidden Access, Unauthorized User"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        clearTokenCookie(res);
        return res.status(401).json({
            message: "Unauthorized user is trying to access, token is invalid"
        });
    }
}


module.exports = { authMiddleware, authSystemUserMiddleware };
