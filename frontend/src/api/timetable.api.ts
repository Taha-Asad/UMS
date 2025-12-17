import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface TimetableEntry {
  schedule_id: number;
  offering_id: number;
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  start_time: string;
  end_time: string;
  room_number: string;
  course_code?: string;
  course_name?: string;
  teacher_name?: string;
}

export const timetableApi = {
  getByOffering: (offeringId: number) =>
    api.get<ApiResponse<TimetableEntry[]>>(`/timetable/offering/${offeringId}`),

  getRoomSchedule: (roomNumber: string) =>
    api.get<ApiResponse<TimetableEntry[]>>(`/timetable/room/${roomNumber}`),

  getStudentTimetable: (studentId: number) =>
    api.get<ApiResponse<TimetableEntry[]>>(`/timetable/student/${studentId}`),

  getTeacherTimetable: (teacherId: number) =>
    api.get<ApiResponse<TimetableEntry[]>>(`/timetable/teacher/${teacherId}`),

  create: (data: Omit<TimetableEntry, "schedule_id">) =>
    api.post<ApiResponse<TimetableEntry>>("/timetable", data),

  update: (scheduleId: number, updates: Partial<TimetableEntry>) =>
    api.put<ApiResponse<TimetableEntry>>(`/timetable/${scheduleId}`, updates),

  delete: (scheduleId: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/timetable/${scheduleId}`),
};
