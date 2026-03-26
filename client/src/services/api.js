import apiClient from "../lib/apiClient";

/**
 * PROFILE ENDPOINTS
 */
export const profileAPI = {
    getProfile: (userId) => apiClient.get(`/profile/${userId}`),
    getMyProfile: () => apiClient.get(`/profile/me/profile`),
    updateProfile: (userId, data) => apiClient.put(`/profile/${userId}`, data),
    updateAvatar: (avatarUrl) =>
        apiClient.patch(`/profile/me/avatar`, { avatarUrl }),
};

/**
 * HOTEL ENDPOINTS
 */
export const hotelAPI = {
    getAllHotels: (page = 1, limit = 12) =>
        apiClient.get(`/hotels?page=${page}&limit=${limit}`),
    getHotelById: (hotelId) => apiClient.get(`/hotels/${hotelId}`),
    searchHotels: (query) => apiClient.get(`/hotels/search?q=${query}`),
    filterHotels: (filters) => apiClient.get(`/hotels/filter`, { params: filters }),
};

/**
 * REVIEW ENDPOINTS
 */
export const reviewAPI = {
    createReview: (data) => apiClient.post(`/reviews`, data),
    getMyReviews: (page = 1, limit = 10) =>
        apiClient.get(`/reviews/me/reviews?page=${page}&limit=${limit}`),
    getHotelReviews: (hotelId, page = 1, limit = 10) =>
        apiClient.get(`/reviews/hotel/${hotelId}?page=${page}&limit=${limit}`),
    getReviewById: (reviewId) => apiClient.get(`/reviews/${reviewId}`),
    updateReview: (reviewId, data) => apiClient.put(`/reviews/${reviewId}`, data),
    deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
    getAverageRating: (hotelId) =>
        apiClient.get(`/reviews/hotel/${hotelId}/average-rating`),
    markHelpful: (reviewId) => apiClient.post(`/reviews/${reviewId}/helpful`),
};

/**
 * FAVOURITE ENDPOINTS
 */
export const favouriteAPI = {
    addFavourite: (hotelId) =>
        apiClient.post(`/favourites`, { hotelId }),
    removeFavourite: (hotelId) =>
        apiClient.delete(`/favourites/${hotelId}`),
    getMyFavourites: (page = 1, limit = 10) =>
        apiClient.get(`/favourites/me?page=${page}&limit=${limit}`),
    checkIsFavourited: (hotelId) =>
        apiClient.get(`/favourites/check/${hotelId}`),
    getFavouriteCount: () => apiClient.get(`/favourites/count`),
};

/**
 * REPORT ENDPOINTS
 */
export const reportAPI = {
    createReport: (data) => apiClient.post(`/reports`, data),
    getMyReports: (page = 1, limit = 10) =>
        apiClient.get(`/reports/me?page=${page}&limit=${limit}`),
    getAllReports: (page = 1, limit = 10) =>
        apiClient.get(`/reports/admin/all?page=${page}&limit=${limit}`),
    updateReportStatus: (reportId, data) =>
        apiClient.put(`/reports/${reportId}`, data),
};

/**
 * TRANSPORT LOG ENDPOINTS
 */
export const transportLogAPI = {
    createLog: (data) => apiClient.post(`/transport-logs`, data),
    getMyLogs: (page = 1, limit = 10) =>
        apiClient.get(`/transport-logs/me?page=${page}&limit=${limit}`),
    updateLog: (logId, data) =>
        apiClient.put(`/transport-logs/${logId}`, data),
    deleteLog: (logId) => apiClient.delete(`/transport-logs/${logId}`),
};

/**
 * ROUTE ENDPOINTS
 */
export const routeAPI = {
    computeRoute: (data) => apiClient.post(`/routes/compute`, data),
    getBestRoute: (source, destination) =>
        apiClient.get(`/routes/best?source=${source}&destination=${destination}`),
};
