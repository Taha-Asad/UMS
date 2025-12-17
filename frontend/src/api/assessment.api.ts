import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Assessment {
  assessment_id: number;
  offering_id: number;
  title: string;
  type:
    | "assignment"
    | "quiz"
    | "midterm"
    | "final"
    | "project"
    | "presentation";
  description?: string;
  total_marks: number;
  due_date: string;
  published: boolean;
  created_at: string;
  course_code?: string;
  course_name?: string;
}

export interface AssessmentStatistics {
  total_submissions: number;
  graded: number;
  average_marks: number;
  highest_marks: number;
  lowest_marks: number;
}

export const assessmentApi = {
  create: (
    data: Omit<Assessment, "assessment_id" | "created_at" | "published">
  ) => api.post<ApiResponse<Assessment>>("/assessments", data),

  getByOffering: (offeringId: number, publishedOnly?: boolean) =>
    api.get<ApiResponse<Assessment[]>>(`/assessments/offering/${offeringId}`, {
      params: { publishedOnly },
    }),

  getUpcoming: (studentId: number, days?: number) =>
    api.get<ApiResponse<Assessment[]>>(
      `/assessments/student/${studentId}/upcoming`,
      {
        params: { days },
      }
    ),

  getByTeacher: (teacherId: number, semesterId?: number) =>
    api.get<ApiResponse<Assessment[]>>(`/assessments/teacher/${teacherId}`, {
      params: { semesterId },
    }),

  publish: (assessmentId: number) =>
    api.put<ApiResponse<{ message: string }>>(
      `/assessments/${assessmentId}/publish`
    ),

  update: (assessmentId: number, updates: Partial<Assessment>) =>
    api.put<ApiResponse<{ message: string }>>(
      `/assessments/${assessmentId}`,
      updates
    ),

  delete: (assessmentId: number) =>
    api.delete<ApiResponse<{ message: string }>>(
      `/assessments/${assessmentId}`
    ),

  getStatistics: (assessmentId: number) =>
    api.get<ApiResponse<AssessmentStatistics>>(
      `/assessments/${assessmentId}/statistics`
    ),
};
