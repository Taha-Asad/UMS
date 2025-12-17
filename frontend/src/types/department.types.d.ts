export interface Department {
  dept_id: number;
  dept_name: string;
  dept_code: string;
  description?: string;
  hod_id?: number;
  hod_name?: string;
  created_at: string;
  is_active: boolean;
}

export interface CreateDepartmentData {
  department_name: string;
  department_code: string;
  description?: string;
  hod_id?: number;
}

export interface UpdateDepartmentData {
  department_name?: string;
  description?: string;
  hod_id?: number;
  is_active?: boolean;
}
