export type UserRole = "admin" | "teacher" | "student" | "staff" | "librarian";

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number;
  department_name?: string;
  profile_photo?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  created_at: string;
  is_active: boolean;
}

export interface StudentProfile extends User {
  student_id: number;
  roll_number: string;
  admission_date: string;
  semester: number;
  cgpa?: number;
  guardian_name?: string;
  guardian_phone?: string;
}

export interface TeacherProfile extends User {
  teacher_id: number;
  employee_id: string;
  designation: string;
  qualification: string;
  specialization?: string;
  joining_date: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: UserRole;
  gender: "male" | "female" | "other";
  date_of_birth: string;
  phone: string;
  address: string;
  department_id?: number;
  // Student specific
  roll_number?: string;
  admission_date?: string;
  guardian_name?: string;
  guardian_phone?: string;
  // Teacher/Staff specific
  employee_id?: string;
  designation?: string;
  qualification?: string;
  specialization?: string;
  joining_date?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
    message: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiErrorResponse {
  message?: string;
}
