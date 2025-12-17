import { api } from "./axios";
import type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "../types";

export const departmentApi = {
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Department>>("/departments", { params }),

  getById: (id: number) =>
    api.get<ApiResponse<Department>>(`/departments/${id}`),

  create: (data: CreateDepartmentData) =>
    api.post<ApiResponse<Department>>("/departments", data),

  update: (id: number, data: UpdateDepartmentData) =>
    api.put<ApiResponse<Department>>(`/departments/${id}`, data),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/departments/${id}`),

  getStats: (id: number) =>
    api.get<
      ApiResponse<{
        totalStudents: number;
        totalTeachers: number;
        totalCourses: number;
      }>
    >(`/departments/${id}/stats`),
};
