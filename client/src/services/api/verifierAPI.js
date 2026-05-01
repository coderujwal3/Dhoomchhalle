import apiClient from "../../lib/apiClient";

// Get dashboard statistics
export async function getDashboardStats() {
  const response = await apiClient.get("/verifier/dashboard/stats");
  return response.data;
}

// Get pending reviews
export async function getPendingReviews(page = 1, limit = 20, search = "", sort = "newest") {
  const response = await apiClient.get("/verifier/reviews/pending", {
    params: { page, limit, search, sort }
  });
  return response.data;
}

// Get pending reviews count
export async function getPendingReviewsCount() {
  const response = await apiClient.get("/verifier/reviews/pending/count");
  return response.data;
}

// Get approved reviews
export async function getApprovedReviews(page = 1, limit = 20) {
  const response = await apiClient.get("/verifier/reviews/approved", {
    params: { page, limit }
  });
  return response.data;
}

// Get rejected reviews
export async function getRejectedReviews(page = 1, limit = 20) {
  const response = await apiClient.get("/verifier/reviews/rejected", {
    params: { page, limit }
  });
  return response.data;
}

// Get review details
export async function getReviewDetails(reviewId) {
  const response = await apiClient.get(`/verifier/reviews/${reviewId}`);
  return response.data;
}

// Approve review
export async function approveReview(reviewId) {
  const response = await apiClient.post(`/verifier/reviews/${reviewId}/approve`);
  return response.data;
}

// Reject review
export async function rejectReview(reviewId, reason) {
  const response = await apiClient.post(`/verifier/reviews/${reviewId}/reject`, { reason });
  return response.data;
}
