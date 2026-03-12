const express = require("express");
const router = express.Router();

const userController = require("./user.controller");

router.post("/register", userController.userRegisterController);
router.post("/login", userController.userLoginController);
router.post("/logout", userController.userLogoutController);

module.exports = router;