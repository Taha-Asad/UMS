import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Notice {
  notice_id: number;
  title: string;
  content: string;
  category: "academic" | "exam" | "event" | "holiday" | "urgent" | "general";
  target_audience: "all" | "students" | "teachers" | "staff" | "department";
  is_important: boolean;
  created_by: number;
  created_at: string;
  expires_at?: string;
}

export const noticeApi = {
  getActiveNotices: () => api.get<ApiResponse<Notice[]>>("/notices"),

  getImportantNotices: () =>
    api.get<ApiResponse<Notice[]>>("/notices/important"),

  searchNotices: (query: string) =>
    api.get<ApiResponse<Notice[]>>("/notices/search", {
      params: { q: query },
    }),

  getNoticeById: (noticeId: number) =>
    api.get<ApiResponse<Notice>>(`/notices/${noticeId}`),

  create: (data: Omit<Notice, "notice_id" | "created_by" | "created_at">) =>
    api.post<ApiResponse<Notice>>("/notices", data),

  update: (noticeId: number, updates: Partial<Notice>) =>
    api.put<ApiResponse<Notice>>(`/notices/${noticeId}`, updates),

  delete: (noticeId: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/notices/${noticeId}`),
};
