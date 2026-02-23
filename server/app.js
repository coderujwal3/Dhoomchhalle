const express = require('express')
const cookieParser = require('cookie-parser')
// const seedSystemBalance = require('../src/seeders/systemuser.seed')

const app = express();

app.use(cookieParser())
app.use(express.json())

// /**
//  * - Routes
//  */
// const authRouter = require('./routes/auth.route')
// const accountRouter = require("./routes/account.routes")
// const TransactionRoutes = require('./routes/transaction.routes')


app.get("/", (req, res) => {
    res.sendFile(__dirname + "../client/index.html")
})

// /**
//  * - Use api routes
//  */
// app.use('/api/auth', authRouter)
// app.use('/api/accounts', accountRouter)
// app.use('/api/transactions', TransactionRoutes)

// seedSystemBalance();

module.exports = app