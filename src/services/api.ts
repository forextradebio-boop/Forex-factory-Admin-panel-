import axios from "axios";

// Read API Base URL from Vite environment, fallback to relative path /api
export const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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

