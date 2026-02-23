require('dotenv').config()
const mongoose = require('mongoose')

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Connected to DB")
        })
        .catch(err => {
            console.log(`Error while connecting to DB ${err}`);
        })
}


module.exports = connectToDB;