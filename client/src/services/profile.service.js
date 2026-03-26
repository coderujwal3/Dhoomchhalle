import apiClient from "../lib/apiClient";

export const getProfile = async (userId) => {
    try {
        const response = await apiClient.get(`/profile/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyProfile = async () => {
    try {
        const response = await apiClient.get(`/profile/me/profile`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateProfile = async (userId, data) => {
    try {
        const response = await apiClient.put(`/profile/${userId}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Upload avatar file
 * @param {File} file - The image file to upload
 * @returns {Promise} Response with updated profile
 */
export const uploadAvatar = async (file) => {
    try {
        // Validate file
        if (!file) {
            throw new Error("No file selected");
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be less than 5MB");
        }

        // Create FormData
        const formData = new FormData();
        formData.append('avatar', file);

        // Upload with Content-Type: multipart/form-data
        const response = await apiClient.patch(`/profile/me/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Deprecated: Use uploadAvatar() instead
export const updateAvatar = async (file) => {
    return uploadAvatar(file);
};

