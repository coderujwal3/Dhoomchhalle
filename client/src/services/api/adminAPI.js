import apiClient from "../../lib/apiClient";

/**
 * Admin API Service
 * Centralized admin API calls
 */
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => apiClient.get("/admin/dashboard/stats"),
  getRecentActivities: (limit = 5) =>
    apiClient.get(`/admin/dashboard/activities?limit=${limit}`),
  getRevenueStats: (period = "month") =>
    apiClient.get(`/admin/dashboard/revenue?period=${period}`),

  // Users
  getAllUsers: (page = 1, limit = 20, role = null, search = '') => {
    let url = `/admin/users?page=${page}&limit=${limit}`;
    if (role) url += `&role=${role}`;
    if (search) url += `&search=${search}`;
    return apiClient.get(url);
  },
  getUserDetails: (userId) => apiClient.get(`/admin/users/${userId}`),
  updateUserRole: (userId, newRole) =>
    apiClient.put(`/admin/users/${userId}/role`, { role: newRole }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  suspendUser: (userId, reason) =>
    apiClient.post(`/admin/users/${userId}/suspend`, { reason }),
  activateUser: (userId) =>
    apiClient.post(`/admin/users/${userId}/activate`),

  // Analytics
  getUserAnalytics: (days = 30) =>
    apiClient.get(`/admin/analytics/users?days=${days}`),
  getHotelAnalytics: (days = 30) =>
    apiClient.get(`/admin/analytics/hotels?days=${days}`),
  getBookingAnalytics: () => apiClient.get("/admin/analytics/bookings"),
  getReportsAnalytics: () => apiClient.get("/admin/analytics/reports"),
  getFareCheckHotspots: (days = 30, limit = 10, minRisk = "medium") =>
    apiClient.get(
      `/fare-checks/hotspots?days=${days}&limit=${limit}&minRisk=${minRisk}`
    ),

  // Reviews
  getPendingReviews: (page = 1, limit = 20) =>
    apiClient.get(`/admin/reviews/pending?page=${page}&limit=${limit}`),
  approveReview: (reviewId) =>
    apiClient.post(`/admin/reviews/${reviewId}/approve`),
  rejectReview: (reviewId, reason) =>
    apiClient.post(`/admin/reviews/${reviewId}/reject`, { reason }),

  // Reports
  getAllReports: (page = 1, limit = 20, status = null) => {
    let url = `/admin/reports?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return apiClient.get(url);
  },
  resolveReport: (reportId, resolution) =>
    apiClient.post(`/admin/reports/${reportId}/resolve`, { resolution }),

  getAllHotels: (page = 1, limit = 20, category = null, search = "") => {
    let url = `/admin/hotels?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${search}`;
    return apiClient.get(url);
  },
  createHotel: (hotelPayload) => apiClient.post("/admin/hotels", hotelPayload),
  getHotelDetails: (hotelId) => apiClient.get(`/admin/hotels/${hotelId}`),
  deleteHotel: (hotelId) => apiClient.delete(`/admin/hotels/${hotelId}`),
  // updateHotelStatus: (hotelId, status) =>
  //   apiClient.put(`/admin/hotels/${hotelId}/status`, { status }),

  // Settings
  getSettings: () => apiClient.get("/admin/settings"),
  updateSettings: (settings) =>
    apiClient.put("/admin/settings", { settings }),
};
