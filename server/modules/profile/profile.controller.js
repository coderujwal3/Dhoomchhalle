const profileService = require("./profile.service");
const { responseFormatter } = require("../../utils/responseFormatter");
const { uploadAvatar } = require("../../services/cloudinary.service");

/**
 * GET /api/v1/profile/:userId
 * Get user profile by user ID
 */
async function getProfileController(req, res) {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!userId || userId.length !== 24) {
            return res.status(400).json(responseFormatter(false, "Invalid user ID format", null, 400));
        }

        const profile = await profileService.getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json(responseFormatter(false, "Profile not found", null, 404));
        }

        return res.status(200).json(responseFormatter(true, "Profile fetched successfully", profile, 200));
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * PUT /api/v1/profile/:userId
 * Update user profile (upsert - create if not exists)
 * Protected route - requires authentication
 */
async function updateProfileController(req, res) {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Validate userId
        if (!userId || userId.length !== 24) {
            return res.status(400).json(responseFormatter(false, "Invalid user ID format", null, 400));
        }

        // Check authorization - user can only update their own profile
        if (req.user._id.toString() !== userId) {
            return res.status(403).json(responseFormatter(false, "Not authorized to update this profile", null, 403));
        }

        // Prevent updating userId
        if (updateData.userId) {
            delete updateData.userId;
        }

        // Get or create profile, then update
        let profile = await profileService.getOrCreateProfile(userId);
        profile = await profileService.updateProfile(userId, updateData);

        return res.status(200).json(responseFormatter(true, "Profile updated successfully", profile, 200));
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * GET /api/v1/profile/me
 * Get authenticated user's profile
 * Protected route
 */
async function getMyProfileController(req, res) {
    try {
        const userId = req.user._id;

        const profile = await profileService.getOrCreateProfile(userId);

        return res.status(200).json(responseFormatter(true, "Your profile fetched successfully", profile, 200));
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

/**
 * PATCH /api/v1/profile/me/avatar
 * Upload and update avatar for authenticated user
 * Protected route - accepts multipart/form-data with 'avatar' file field
 */
async function updateMyAvatarController(req, res) {
    try {
        const userId = req.user._id;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json(responseFormatter(false, "Avatar file is required", null, 400));
        }

        // Validate file size (additional check)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json(responseFormatter(false, "File size exceeds 5MB limit", null, 400));
        }

        // Upload to Cloudinary
        const avatarUrl = await uploadAvatar(req.file.buffer, userId.toString());

        // Update profile with new avatar URL
        const profile = await profileService.updateProfileAvatar(userId, avatarUrl);

        return res.status(200).json(responseFormatter(true, "Avatar uploaded and updated successfully", profile, 200));
    } catch (error) {
        console.error("Error updating avatar:", error);
        return res.status(500).json(responseFormatter(false, error.message, null, 500));
    }
}

module.exports = {
    getProfileController,
    updateProfileController,
    getMyProfileController,
    updateMyAvatarController,
};
