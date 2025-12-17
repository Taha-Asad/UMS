export type EnrollmentStatus = "enrolled" | "dropped" | "completed" | "failed";

export interface EnrollmentFilters {
  student_id?: number;
  offering_id?: number;
  status?: EnrollmentStatus;
}

export interface EnrollmentSummary {
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  failed_enrollments: number;
}


