require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors');

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));

const userRoutes = require('./modules/user/user.routes')
const hotelRoutes = require('./modules/hotel/hotel.routes')

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/hotels", hotelRoutes);

// Backward compatibility for existing clients
app.use("/api/auth", userRoutes);

module.exports = app