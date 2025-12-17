export const APP_NAME = "University Management System";
export const APP_SHORT_NAME = "UMS";
export const APP_VERSION = "1.0.0";

export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  STAFF: "staff",
  LIBRARIAN: "librarian",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  staff: "Staff",
  librarian: "Librarian",
};

export const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500",
  teacher: "bg-blue-500",
  student: "bg-green-500",
  staff: "bg-orange-500",
  librarian: "bg-pink-500",
};

export const ENROLLMENT_STATUS = {
  ENROLLED: "enrolled",
  DROPPED: "dropped",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  enrolled: "badge-info",
  dropped: "badge-warning",
  completed: "badge-success",
  failed: "badge-danger",
};

export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0,
  A: 3.7,
  "B+": 3.3,
  B: 3.0,
  "C+": 2.7,
  C: 2.3,
  D: 2.0,
  F: 0.0,
};

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const SEMESTERS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
  { value: 3, label: "Semester 3" },
  { value: 4, label: "Semester 4" },
  { value: 5, label: "Semester 5" },
  { value: 6, label: "Semester 6" },
  { value: 7, label: "Semester 7" },
  { value: 8, label: "Semester 8" },
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    CHANGE_PASSWORD: "/auth/change-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: "/users",
  DEPARTMENTS: "/departments",
  COURSES: "/courses",
  ENROLLMENTS: "/enrollments",
  ATTENDANCE: "/attendance",
  GRADES: "/grades",
  FEES: "/fees",
  LIBRARY: "/library",
};
