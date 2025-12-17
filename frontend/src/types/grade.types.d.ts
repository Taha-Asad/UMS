export type AssessmentType =
  | "assignment"
  | "quiz"
  | "midterm"
  | "final"
  | "project"
  | "practical"
  | "other";

export interface GradeRecord {
  grade_id: number;
  offering_id: number;
  student_id: number;
  assessment_type: AssessmentType;
  assessment_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string; // letter grade
  graded_by: number;
  graded_at: string;
  updated_at?: string;
}

export interface GradeSubmissionEntry {
  student_id: number;
  obtained_marks: number;
}

export interface GradeSubmissionInput {
  offering_id: number;
  assessment_type: AssessmentType;
  assessment_name: string;
  total_marks: number;
  entries: GradeSubmissionEntry[];
}

export interface TranscriptEntry {
  course_code: string;
  course_name: string;
  semester_id: number;
  credits: number;
  grade: string;
  grade_points: number;
}

export interface Transcript {
  student_id: number;
  cgpa: number;
  entries: TranscriptEntry[];
}
