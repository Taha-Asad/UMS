export type NoticeCategory =
  | "academic"
  | "exam"
  | "event"
  | "holiday"
  | "urgent"
  | "general";

export type NoticeAudience =
  | "all"
  | "students"
  | "teachers"
  | "staff"
  | "department";

export interface Notice {
  notice_id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  posted_by: number;
  posted_by_name?: string;
  target_audience: NoticeAudience;
  department_id?: number | null;
  dept_name?: string | null;
  attachment_url?: string | null;
  is_important: boolean;
  expiry_date?: string | null;
  view_count?: number;
  created_at: string;
}


