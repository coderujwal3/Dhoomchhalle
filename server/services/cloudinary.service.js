const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image to Cloudinary
 * @param {string} fileBuffer - Base64 encoded file or file buffer
 * @param {string} folderName - Cloudinary folder name
 * @param {string} publicId - Public ID for the file (optional)
 * @returns {Promise<Object>} Cloudinary response with secure_url
 */
async function uploadToCloudinary(fileBuffer, folderName = 'dhoomchhalle', publicId = null) {
    try {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: folderName,
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto',
            };

            // If publicId is provided, it will replace the existing image
            if (publicId) {
                uploadOptions.public_id = publicId;
                uploadOptions.overwrite = true;
            }

            // Upload stream from buffer
            const uploadStream = cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, result) => {
                    if (error) {
                        reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    } else {
                        resolve(result);
                    }
                }
            );

            // Write buffer to stream
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        throw new Error(`Error uploading to Cloudinary: ${error.message}`);
    }
}

/**
 * Upload avatar image to Cloudinary
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<string>} Secure URL of uploaded image
 */
async function uploadAvatar(imageBuffer, userId) {
    try {
        const result = await uploadToCloudinary(
            imageBuffer,
            `dhoomchhalle/avatars/${userId}`,
            `avatar_${userId}`
        );

        return result.secure_url;
    } catch (error) {
        throw new Error(`Avatar upload failed: ${error.message}`);
    }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFromCloudinary(publicId) {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error(`Error deleting from Cloudinary: ${error.message}`);
    }
}

/**
 * Delete avatar from Cloudinary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteAvatar(userId) {
    try {
        const publicId = `dhoomchhalle/avatars/${userId}/avatar_${userId}`;
        return await deleteFromCloudinary(publicId);
    } catch (error) {
        console.log('Note: Avatar deletion (may not exist):', error.message);
        return { result: 'ok' }; // Don't fail if avatar doesn't exist
    }
}

module.exports = {
    uploadToCloudinary,
    uploadAvatar,
    deleteFromCloudinary,
    deleteAvatar,
    cloudinary,
};
