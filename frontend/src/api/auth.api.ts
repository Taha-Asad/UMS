import { api } from "./axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ChangePasswordData,
  ApiResponse,
} from "../types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login", credentials),

  register: (data: RegisterData) =>
    api.post<AuthResponse>("/auth/register", data),

  logout: () => api.post<ApiResponse<null>>("/auth/logout"),

  refreshToken: () => api.post<AuthResponse>("/auth/refresh"),

  changePassword: (data: ChangePasswordData) =>
    api.post<ApiResponse<null>>("/auth/change-password", data),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<null>>("/auth/reset-password", { token, password }),

  verifyToken: () => api.get<AuthResponse>("/auth/verify"),
};
