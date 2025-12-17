import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface AttendanceRecord {
  attendance_id: number;
  enrollment_id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  marked_by: number;
  created_at: string;
}

export interface AttendanceData {
  studentId: number;
  status: "present" | "absent" | "late" | "excused";
}

export interface AttendanceStats {
  total_classes: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
}

export const attendanceApi = {
  markAttendance: (
    offeringId: number,
    date: string,
    attendanceData: AttendanceData[]
  ) =>
    api.post<ApiResponse<{ message: string }>>("/attendance/mark", {
      offeringId,
      date,
      attendanceData,
    }),

  getAttendanceByDate: (offeringId: number, date: string) =>
    api.get<ApiResponse<AttendanceRecord[]>>(
      `/attendance/course/${offeringId}`,
      {
        params: { date },
      }
    ),

  getStudentAttendance: (studentId: number, offeringId: number) =>
    api.get<ApiResponse<AttendanceStats>>(
      `/attendance/student/${studentId}/${offeringId}`
    ),

  getCourseAttendanceStats: (offeringId: number) =>
    api.get<ApiResponse<AttendanceStats>>(
      `/attendance/course/${offeringId}/stats`
    ),

  updateAttendance: (
    attendanceId: number,
    updates: Partial<AttendanceRecord>
  ) =>
    api.put<ApiResponse<{ message: string }>>(
      `/attendance/${attendanceId}`,
      updates
    ),

  getAttendanceReport: (
    offeringId: number,
    startDate?: string,
    endDate?: string
  ) =>
    api.get<ApiResponse<AttendanceStats>>("/attendance/report", {
      params: { offeringId, startDate, endDate },
    }),
};
