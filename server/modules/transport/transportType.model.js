const mongoose = require("mongoose");

const transportTypeSchema = new mongoose.Schema({
    typeName: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model("TransportType", transportTypeSchema);