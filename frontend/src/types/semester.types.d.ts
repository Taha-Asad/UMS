export interface Semester {
  semester_id: number;
  semester_name: string;
  academic_year: string; // e.g., "2024-2025"
  start_date: string; // ISO date
  end_date: string; // ISO date
  registration_start?: string | null;
  registration_end?: string | null;
  is_current: boolean;
  created_at?: string;
}


