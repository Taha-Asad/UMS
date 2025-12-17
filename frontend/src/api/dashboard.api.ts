import { api } from "./axios";
import type {
  ApiResponse,
  StudentDashboardData,
  TeacherDashboardData,
  AdminDashboardData,
} from "../types";

export const dashboardApi = {
  getStudentDashboard: () =>
    api.get<ApiResponse<StudentDashboardData>>("/dashboard/student"),

  getTeacherDashboard: () =>
    api.get<ApiResponse<TeacherDashboardData>>("/dashboard/teacher"),

  getAdminDashboard: () =>
    api.get<ApiResponse<AdminDashboardData>>("/dashboard/admin"),
};


