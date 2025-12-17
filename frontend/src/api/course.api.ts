import { api } from "./axios";
import type {
  Course,
  CourseOffering,
  Enrollment,
  CreateCourseData,
  UpdateCourseData,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "../types";

export const courseApi = {
  // Courses
  getAll: (params?: QueryParams) =>
    api.get<PaginatedResponse<Course>>("/courses", { params }),

  getById: (id: number) => api.get<ApiResponse<Course>>(`/courses/${id}`),

  create: (data: CreateCourseData) =>
    api.post<ApiResponse<Course>>("/courses", data),

  update: (id: number, data: UpdateCourseData) =>
    api.put<ApiResponse<Course>>(`/courses/${id}`, data),

  delete: (id: number) => api.delete<ApiResponse<null>>(`/courses/${id}`),

  // Course Offerings
  getOfferings: (params?: QueryParams) =>
    api.get<PaginatedResponse<CourseOffering>>("/courses/offerings", {
      params,
    }),

  getOfferingById: (id: number) =>
    api.get<ApiResponse<CourseOffering>>(`/courses/offerings/${id}`),

  createOffering: (data: {
    course_id: number;
    semester_id: number;
    teacher_id: number;
    room_number?: string;
    max_students?: number;
  }) => api.post<ApiResponse<CourseOffering>>("/courses/offerings", data),

  // Enrollments
  getEnrollments: (offeringId: number, params?: QueryParams) =>
    api.get<PaginatedResponse<Enrollment>>(
      `/courses/offerings/${offeringId}/enrollments`,
      { params }
    ),

  enrollStudent: (offeringId: number, studentId: number) =>
    api.post<ApiResponse<Enrollment>>(
      `/courses/offerings/${offeringId}/enroll`,
      { student_id: studentId }
    ),

  dropStudent: (enrollmentId: number) =>
    api.post<ApiResponse<null>>(`/enrollments/${enrollmentId}/drop`),

  // Student's courses
  getStudentCourses: (studentId: number, params?: QueryParams) =>
    api.get<PaginatedResponse<Enrollment>>(`/students/${studentId}/courses`, {
      params,
    }),

  // Teacher's courses
  getTeacherCourses: (teacherId: number, params?: QueryParams) =>
    api.get<PaginatedResponse<CourseOffering>>(
      `/teachers/${teacherId}/courses`,
      { params }
    ),
};
