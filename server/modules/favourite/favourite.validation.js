const { body } = require("express-validator");

const addFavouriteValidation = [
    body("hotelId")
        .notEmpty()
        .withMessage("Hotel ID is required")
        .isMongoId()
        .withMessage("Invalid Hotel ID format"),
];

module.exports = {
    addFavouriteValidation,
};
