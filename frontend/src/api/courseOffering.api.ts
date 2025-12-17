import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface CourseOffering {
  offering_id: number;
  course_id: number;
  semester_id: number;
  teacher_id?: number;
  max_students?: number;
  current_enrollment: number;
  course_code?: string;
  course_name?: string;
  teacher_name?: string;
  semester_name?: string;
}

export const courseOfferingApi = {
  getBySemester: (semesterId: number) =>
    api.get<ApiResponse<CourseOffering[]>>(
      `/course-offerings/semester/${semesterId}`
    ),

  getByTeacher: (teacherId: number) =>
    api.get<ApiResponse<CourseOffering[]>>(
      `/course-offerings/teacher/${teacherId}`
    ),

  getAvailableForStudent: (studentId: number, semesterId: number) =>
    api.get<ApiResponse<CourseOffering[]>>(
      `/course-offerings/available/${studentId}/${semesterId}`
    ),

  getById: (offeringId: number) =>
    api.get<ApiResponse<CourseOffering>>(`/course-offerings/${offeringId}`),

  checkCapacity: (offeringId: number) =>
    api.get<ApiResponse<{ available: number; max: number }>>(
      `/course-offerings/${offeringId}/capacity`
    ),

  create: (data: Omit<CourseOffering, "offering_id" | "current_enrollment">) =>
    api.post<ApiResponse<CourseOffering>>("/course-offerings", data),

  update: (offeringId: number, updates: Partial<CourseOffering>) =>
    api.put<ApiResponse<CourseOffering>>(
      `/course-offerings/${offeringId}`,
      updates
    ),
};
