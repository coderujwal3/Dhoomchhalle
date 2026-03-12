require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
// const seedVaranasiData = require('./seed/Varanasi.seed')
const cors = require('cors');

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(cors());

// /**
//  * - Routes
//  */
const userRoutes = require('./modules/user/user.routes')

// /**
//  * - Use api routes
//  */
app.use("/api/auth", userRoutes);


// seedSystemBalance();

module.exports = app