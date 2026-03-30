require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const helmet = require("helmet");

const app = express();

app.set("trust proxy", 1);
app.use(cookieParser())
app.use(helmet());
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true
}));

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per windowMs
  message: "Too many requests, please try again later."
});
// apply rate limiter to all requests
app.use(limiter);

/**
 * Routes for modules - user, hotels, transport, timings
 */
const userRoutes = require('./modules/user/user.routes')
const hotelRoutes = require('./modules/hotel/hotel.routes')
const profileRoutes = require('./modules/profile/profile.routes')
const reviewRoutes = require('./modules/review/review.routes')
const favouriteRoutes = require('./modules/favourite/favourite.routes')
const reportRoutes = require('./modules/report/report.routes')
const transportLogRoutes = require('./modules/transportLog/transportLog.routes')
const adminRoutes = require('./modules/admin/admin.routes')
// const routeRoutes = require('./modules/route/route.routes')

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/favourites", favouriteRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/transport-logs", transportLogRoutes);
app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/routes", routeRoutes);

// Backward compatibility for existing clients
app.use("/api/auth", userRoutes);

module.exports = app
