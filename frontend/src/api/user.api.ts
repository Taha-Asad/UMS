import { api } from "./axios";
import type {
  User,
  CreateUserData,
  UpdateUserData,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  StudentProfile,
  TeacherProfile,
} from "../types";

export const userApi = {
  // Get all users with pagination and filters
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<User>>("/users", { params }),

  // Get user by ID
  getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),

  // Create new user
  create: (data: CreateUserData) => api.post<ApiResponse<User>>("/users", data),

  // Update user
  update: (id: number, data: UpdateUserData) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  // Delete user
  delete: (id: number) => api.delete<ApiResponse<null>>(`/users/${id}`),

  // Get current user profile
  getProfile: () => api.get<ApiResponse<User>>("/users/profile"),

  // Update current user profile
  updateProfile: (data: UpdateUserData) =>
    api.put<ApiResponse<User>>("/users/profile", data),

  // Upload profile photo
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return api.post<ApiResponse<{ url: string }>>(
      "/users/profile/photo",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  // Get students
  getStudents: (params?: QueryParams) =>
    api.get<PaginatedResponse<StudentProfile>>("/users/students", { params }),

  // Get teachers
  getTeachers: (params?: QueryParams) =>
    api.get<PaginatedResponse<TeacherProfile>>("/users/teachers", { params }),

  // Get user statistics
  getStats: () =>
    api.get<
      ApiResponse<{
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        totalStaff: number;
        activeUsers: number;
      }>
    >("/users/stats"),
};
