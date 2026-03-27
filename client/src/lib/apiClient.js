import axios from "axios";

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

function isExpectedAuthFailure(config) {
  const url = (config?.url || "").toLowerCase();
  return url.includes("/auth/login") || url.includes("/auth/register");
}

/** Only these areas should force navigation to /login on 401; public pages (e.g. Home) stay put. */
function shouldForceLoginRedirect(pathname) {
  return pathname.startsWith("/dashboard");
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const cfg = error.config;

    if (status === 401 && !isExpectedAuthFailure(cfg)) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (shouldForceLoginRedirect(pathname)) {
          window.location.assign("/login");
        } else {
          window.dispatchEvent(new Event("dhoom-auth-changed"));
        }
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;