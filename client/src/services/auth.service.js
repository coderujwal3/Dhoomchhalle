import apiClient from "../lib/apiClient";

export async function getSession() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function register(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

export async function logout() {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}

export async function forgotPassword(payload) {
  const response = await apiClient.post("/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(token, payload) {
  const response = await apiClient.post(`/auth/reset-password/${token}`, payload);
  return response.data;
}

export async function verifyOTP(payload) {
  const response = await apiClient.post("/auth/verify-otp", payload);
  return response.data;
}

export async function resendOTP(payload = {}) {
  const response = await apiClient.post("/auth/resend-otp", payload);
  return response.data;
}

export async function enable2FA() {
  const response = await apiClient.post("/auth/enable-2fa");
  return response.data;
}

export async function disable2FA() {
  const response = await apiClient.post("/auth/disable-2fa");
  return response.data;
}
