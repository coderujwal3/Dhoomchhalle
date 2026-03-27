const profileModel = require("./profile.model");
const userModel = require("../user/user.model");

/**
 * Get profile by user ID
 */
async function getProfileByUserId(userId) {
    try {
        const profile = await profileModel.findOne({ userId }).populate("userId", "email name phone role");
        return profile;
    } catch (error) {
        throw new Error(`Error fetching profile: ${error.message}`);
    }
}

/**
 * Get or create profile for a user
 */
async function getOrCreateProfile(userId) {
    try {
        let profile = await profileModel.findOne({ userId });
        if (!profile) {
            const user = await userModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            profile = await profileModel.create({
                userId,
            });
        }
        return await profileModel.findOne({ userId }).populate("userId", "email name phone role");
    } catch (error) {
        throw new Error(`Error getting or creating profile: ${error.message}`);
    }
}

/**
 * Update profile
 */
async function updateProfile(userId, updateData) {
    try {
        const profile = await profileModel.findOneAndUpdate(
            { userId },
            {updateData: {$eq: updateData}},
            { returnDocument: 'after', runValidators: true }
        ).populate("userId", "email name phone role");

        if (!profile) {
            throw new Error("Profile not found");
        }

        return profile;
    } catch (error) {
        throw new Error(`Error updating profile: ${error.message}`);
    }
}

/**
 * Update profile avatar
 */
async function updateProfileAvatar(userId, avatarUrl) {
    try {
        const profile = await profileModel.findOneAndUpdate(
            { userId },
            { avatar: avatarUrl },
            { returnDocument: 'after', runValidators: true }
        ).populate("userId", "email name phone role");

        if (!profile) {
            throw new Error("Profile not found");
        }

        return profile;
    } catch (error) {
        throw new Error(`Error updating avatar: ${error.message}`);
    }
}

/**
 * Increment stats (trips, hotels, reviews)
 */
async function incrementStat(userId, statName, increment = 1) {
    try {
        const updateObj = {};
        updateObj[`stats.${statName}`] = increment;

        const profile = await profileModel.findOneAndUpdate(
            { userId },
            { $inc: updateObj },
            { returnDocument: 'after' }
        );

        if (!profile) {
            throw new Error("Profile not found");
        }

        return profile;
    } catch (error) {
        throw new Error(`Error incrementing stat: ${error.message}`);
    }
}

/**
 * Delete profile
 */
async function deleteProfile(userId) {
    try {
        const result = await profileModel.deleteOne({ userId });
        return result.deletedCount > 0;
    } catch (error) {
        throw new Error(`Error deleting profile: ${error.message}`);
    }
}

module.exports = {
    getProfileByUserId,
    getOrCreateProfile,
    updateProfile,
    updateProfileAvatar,
    incrementStat,
    deleteProfile,
};
