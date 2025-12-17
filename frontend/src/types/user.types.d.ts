import { User, UserRole, StudentProfile, TeacherProfile } from "./auth.types";

export interface UserFilters {
  role?: UserRole;
  department_id?: number;
  is_active?: boolean;
  search?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  department_id?: number;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  is_active?: boolean;
}

export type { User, UserRole, StudentProfile, TeacherProfile };
