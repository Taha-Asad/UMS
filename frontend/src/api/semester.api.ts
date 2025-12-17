import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Semester {
  semester_id: number;
  semester_name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  registration_open: boolean;
  created_at: string;
}

export const semesterApi = {
  getAll: () => api.get<ApiResponse<Semester[]>>("/semesters"),

  getCurrent: () => api.get<ApiResponse<Semester>>("/semesters/current"),

  getById: (semesterId: number) =>
    api.get<ApiResponse<Semester>>(`/semesters/${semesterId}`),

  checkRegistrationOpen: (semesterId: number) =>
    api.get<ApiResponse<{ registration_open: boolean }>>(
      `/semesters/${semesterId}/registration-status`
    ),

  create: (data: Omit<Semester, "semester_id" | "is_current" | "created_at">) =>
    api.post<ApiResponse<Semester>>("/semesters", data),

  update: (semesterId: number, updates: Partial<Semester>) =>
    api.put<ApiResponse<Semester>>(`/semesters/${semesterId}`, updates),

  setCurrent: (semesterId: number) =>
    api.put<ApiResponse<{ message: string }>>(
      `/semesters/${semesterId}/set-current`
    ),
};
