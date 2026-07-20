import axios from "axios";

// Read API Base URL from Vite environment, fallback to the live Render backend
export const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string) ||
  "https://forex-backend-iem1.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if stored and normalize API paths
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = config.url || "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const baseUrl = typeof config.baseURL === "string" ? config.baseURL : "";
      const baseHasApi = baseUrl.includes("/api");
      if (!baseHasApi && !url.startsWith("/api") && !url.startsWith("/uploads")) {
        config.url = `/api${url.startsWith("/") ? url : `/${url}`}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors, automatic logout on 401 (session expired)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Auto logout on 401 Unauthorized (unless it's already the login page)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      
      // Clear token and reload or trigger event to notify AuthContext
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      
      // Custom event to handle automatic logout in react application
      window.dispatchEvent(new Event("admin_session_expired"));
    }
    
    // Return standard error message or generic one
    const message = error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

