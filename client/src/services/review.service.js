import { reviewAPI } from "./api";

export const createReview = async (data) => {
    try {
        const response = await reviewAPI.createReview(data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyReviews = async (page = 1, limit = 10) => {
    try {
        const response = await reviewAPI.getMyReviews(page, limit);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getHotelReviews = async (hotelId, page = 1, limit = 10) => {
    try {
        const response = await reviewAPI.getHotelReviews(hotelId, page, limit);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateReview = async (reviewId, data) => {
    try {
        const response = await reviewAPI.updateReview(reviewId, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const response = await reviewAPI.deleteReview(reviewId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getAverageRating = async (hotelId) => {
    try {
        const response = await reviewAPI.getAverageRating(hotelId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const markReviewHelpful = async (reviewId) => {
    try {
        const response = await reviewAPI.markHelpful(reviewId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
