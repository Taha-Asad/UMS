export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  department_id: number;
  department_name?: string;
  description?: string;
  syllabus_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CourseOffering {
  offering_id: number;
  course_id: number;
  course_code: string;
  course_name: string;
  semester_id: number;
  semester_name: string;
  teacher_id: number;
  teacher_name: string;
  room_number?: string;
  schedule?: string;
  max_students: number;
  enrolled_count: number;
}

export interface Enrollment {
  enrollment_id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  offering_id: number;
  course_code: string;
  course_name: string;
  status: "enrolled" | "dropped" | "completed" | "failed";
  enrollment_date: string;
  grade?: string;
  marks?: number;
}

export interface CreateCourseData {
  course_code: string;
  course_name: string;
  credits: number;
  department_id: number;
  description?: string;
}

export interface UpdateCourseData {
  course_name?: string;
  credits?: number;
  department_id?: number;
  description?: string;
  is_active?: boolean;
}
