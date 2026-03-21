import apiClient from "../lib/apiClient";

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
