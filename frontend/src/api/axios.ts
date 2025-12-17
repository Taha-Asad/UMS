import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// URLs that should NOT trigger token refresh
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (
    error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>
  ) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if this is an auth endpoint - DON'T refresh for these
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    // Handle 401 Unauthorized
    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. We haven't already retried this request
    // 3. It's NOT an auth endpoint (login, register, refresh, etc.)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const { accessToken } = response.data.data;

        useAuthStore.getState().setToken(accessToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        useAuthStore.getState().logout();

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle error messages
    const message = error.response?.data?.message || "An error occurred";

    // Don't show toast for:
    // - 401 on non-auth endpoints (handled by refresh logic)
    // - 401 on auth endpoints (form will show the error)
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiMethods = {
  get: <T>(url: string, params?: object) =>
    api.get<T>(url, { params }).then((res) => res.data),

  post: <T>(url: string, data?: object) =>
    api.post<T>(url, data).then((res) => res.data),

  put: <T>(url: string, data?: object) =>
    api.put<T>(url, data).then((res) => res.data),

  patch: <T>(url: string, data?: object) =>
    api.patch<T>(url, data).then((res) => res.data),

  delete: <T>(url: string) => api.delete<T>(url).then((res) => res.data),
};

export default api;
