import type { NoticeCategory } from "./notification.types";

export type DashboardRole = "admin" | "teacher" | "student" | "staff" | "librarian";

/* =======================
   STUDENT DASHBOARD
   ======================= */

export interface StudentDashboardInfo {
  full_name: string;
  roll_number: string | null;
  department: string | null;
  semester: number | null;
  cgpa: number | null;
  current_courses: number;
  completed_courses: number;
  pending_fees: number;
}

export interface StudentDashboardNotice {
  title: string;
  content: string;
  category: NoticeCategory;
  created_at: string;
}

export type AssessmentDashboardType =
  | "assignment"
  | "quiz"
  | "midterm"
  | "final"
  | "project"
  | "presentation";

export interface StudentDashboardAssessment {
  title: string;
  type: AssessmentDashboardType;
  due_date: string;
  course_code: string;
  course_name: string;
}

export interface StudentDashboardData {
  studentInfo: StudentDashboardInfo | null;
  recentNotices: StudentDashboardNotice[];
  upcomingAssessments: StudentDashboardAssessment[];
}

/* =======================
   TEACHER DASHBOARD
   ======================= */

export interface TeacherDashboardInfo {
  full_name: string;
  employee_id: string | null;
  department: string | null;
  designation: string | null;
  total_courses: number;
  total_students: number;
}

export interface TeacherDashboardCourse {
  course_code: string;
  course_name: string;
  enrolled_students: number;
  max_students: number;
  semester_name: string;
}

export interface TeacherDashboardData {
  teacherInfo: TeacherDashboardInfo | null;
  currentCourses: TeacherDashboardCourse[];
  pendingGrades: number;
}

/* =======================
   ADMIN DASHBOARD
   ======================= */

export interface AdminDashboardStats {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_departments: number;
}

export interface AdminDashboardRevenueStats {
  total_fees_generated: number;
  total_fees_collected: number;
  outstanding_amount: number;
}

export type AuditOperation = "INSERT" | "UPDATE" | "DELETE";

export interface AdminDashboardActivity {
  table_name: string;
  operation: AuditOperation;
  user_id: number | null;
  timestamp: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  revenueStats: AdminDashboardRevenueStats;
  recentActivities: AdminDashboardActivity[];
}


