export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  attendance_id: number;
  offering_id: number;
  student_id: number;
  date: string; // ISO date
  status: AttendanceStatus;
  marked_by: number;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceSummary {
  offering_id?: number;
  student_id?: number;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number; // 0-100
}

export interface MarkAttendanceInput {
  offering_id: number;
  date: string; // YYYY-MM-DD
  records: {
    student_id: number;
    status: AttendanceStatus;
  }[];
}
