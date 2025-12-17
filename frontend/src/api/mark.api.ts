import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Mark {
  mark_id: number;
  assessment_id: number;
  student_id: number;
  marks_obtained: number;
  total_marks: number;
  graded_by?: number;
  graded_at?: string;
  feedback?: string;
  submitted_at?: string;
  student_name?: string;
  assessment_title?: string;
}

export interface FinalGrade {
  enrollment_id: number;
  total_marks: number;
  grade: string;
  gpa: number;
}

export interface ClassPerformance {
  average_marks: number;
  highest_marks: number;
  lowest_marks: number;
  pass_rate: number;
  grade_distribution: Record<string, number>;
}

export const markApi = {
  submitAssignment: (
    assessmentId: number,
    studentId: number,
    submissionData?: Record<string, null | string>
  ) =>
    api.post<ApiResponse<{ message: string }>>("/marks/submit", {
      assessmentId,
      studentId,
      ...submissionData,
    }),

  gradeSubmission: (markId: number, marks: number, feedback?: string) =>
    api.put<ApiResponse<{ message: string }>>(`/marks/${markId}/grade`, {
      marks,
      feedback,
    }),

  bulkGrade: (
    assessmentId: number,
    grades: Array<{ studentId: number; marks: number; feedback?: string }>
  ) =>
    api.post<ApiResponse<{ message: string }>>("/marks/bulk-grade", {
      assessmentId,
      grades,
    }),

  getMarksByAssessment: (assessmentId: number) =>
    api.get<ApiResponse<Mark[]>>(`/marks/assessment/${assessmentId}`),

  getMarksByStudent: (studentId: number) =>
    api.get<ApiResponse<Mark[]>>(`/marks/student/${studentId}`),

  getUngraded: (teacherId: number) =>
    api.get<ApiResponse<Mark[]>>(`/marks/ungraded/${teacherId}`),

  calculateFinalGrade: (studentId: number, offeringId: number) =>
    api.get<ApiResponse<FinalGrade>>(
      `/marks/final-grade/${studentId}/${offeringId}`
    ),

  getClassPerformance: (assessmentId: number) =>
    api.get<ApiResponse<ClassPerformance>>(
      `/marks/performance/${assessmentId}`
    ),
};
