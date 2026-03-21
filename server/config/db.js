require('dotenv').config()
const mongoose = require('mongoose')

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to DB")
    } catch (err) {
        console.log(`Error while connecting to DB ${err}`);
        throw err
    }
}


module.exports = connectToDB;