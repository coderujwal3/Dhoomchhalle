const express = require("express");
const router = express.Router();

const profileController = require("./profile.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { validateRequest } = require("../../middlewares/validate.middleware");
const { uploadAvatarMiddleware, handleUploadError } = require("../../middlewares/upload.middleware");
const {
    updateProfileValidation,
} = require("./profile.validation");

/**
 * Protected routes (require authentication)
 */
router.get("/me/profile", authMiddleware, profileController.getMyProfileController);
router.put("/:userId", authMiddleware, updateProfileValidation, validateRequest, profileController.updateProfileController);
router.patch("/me/avatar", authMiddleware, uploadAvatarMiddleware, handleUploadError, profileController.updateMyAvatarController);

/**
 * Public routes
 */
router.get("/:userId", profileController.getProfileController);

module.exports = router;
