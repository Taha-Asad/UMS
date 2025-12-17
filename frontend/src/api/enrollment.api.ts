import { api } from "./axios";
import type { ApiResponse, CourseOffering } from "../types";

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  offering_id: number;
  enrollment_date: string;
  status: "enrolled" | "dropped" | "completed" | "failed";
  final_grade?: string;
  marks?: number;
  course_code?: string;
  course_name?: string;
  teacher_name?: string;
  semester_name?: string;
}

export const enrollmentApi = {
  enrollStudent: (studentId: number, offeringId: number) =>
    api.post<ApiResponse<Enrollment>>("/enrollments", {
      studentId,
      offeringId,
    }),

  dropCourse: (enrollmentId: number) =>
    api.put<ApiResponse<{ message: string }>>(
      `/enrollments/${enrollmentId}/drop`
    ),

  updateGrade: (enrollmentId: number, marks: number) =>
    api.put<ApiResponse<{ message: string }>>(
      `/enrollments/${enrollmentId}/grade`,
      {
        marks,
      }
    ),

  getStudentEnrollments: (studentId: number, status?: string) =>
    api.get<ApiResponse<Enrollment[]>>(`/enrollments/student/${studentId}`, {
      params: { status },
    }),

  getCourseEnrollments: (offeringId: number) =>
    api.get<ApiResponse<Enrollment[]>>(`/enrollments/course/${offeringId}`),

  getAvailableCourses: (studentId: number, semesterId: number) =>
    api.get<ApiResponse<CourseOffering[]>>(
      `/enrollments/available/${studentId}`,
      {
        params: { semesterId },
      }
    ),

  calculateCGPA: (studentId: number) =>
    api.get<ApiResponse<{ cgpa: number }>>(`/enrollments/cgpa/${studentId}`),

  getEnrollmentStats: () =>
    api.get<
      ApiResponse<{
        totalStudents: number;
        totalTeachers: number;
        totalCourses: number;
      }>
    >("/enrollments/stats"),
};
