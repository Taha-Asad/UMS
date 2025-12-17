import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Department extends RowDataPacket {
  dept_id: number;
  dept_code: string;
  dept_name: string;
  head_of_dept?: number | null;
  establishment_year?: number | null;
  is_active?: boolean;
  created_at?: Date;
}

export class DepartmentModel {
  static async create(department: Partial<Department>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO departments (dept_code, dept_name, head_of_dept, establishment_year, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        department.dept_code,
        department.dept_name,
        department.head_of_dept || null,
        department.establishment_year || null,
        department.is_active !== false,
      ]
    );
    return result.insertId;
  }

  static async findById(deptId: number): Promise<Department | null> {
    const [rows] = await pool.execute<Department[]>(
      `SELECT d.*, u.full_name as head_name 
       FROM departments d 
       LEFT JOIN users u ON d.head_of_dept = u.user_id 
       WHERE d.dept_id = ?`,
      [deptId]
    );
    return rows[0] || null;
  }

  static async findByCode(deptCode: string): Promise<Department | null> {
    const [rows] = await pool.execute<Department[]>(
      "SELECT * FROM departments WHERE dept_code = ?",
      [deptCode]
    );
    return rows[0] || null;
  }

  static async getAll(includeInactive = false): Promise<Department[]> {
    const query = includeInactive
      ? "SELECT * FROM departments ORDER BY dept_name"
      : "SELECT * FROM departments WHERE is_active = TRUE ORDER BY dept_name";

    const [rows] = await pool.execute<Department[]>(query);
    return rows;
  }

  static async update(
    deptId: number,
    updates: Partial<Department>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE departments SET ${setClause} WHERE dept_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      deptId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(deptId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE departments SET is_active = FALSE WHERE dept_id = ?",
      [deptId]
    );
    return result.affectedRows > 0;
  }

  static async getCourseCount(deptId: number): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      "SELECT COUNT(*) as count FROM courses WHERE department_id = ? AND is_active = TRUE",
      [deptId]
    );
    return rows[0].count;
  }

  static async getStudentCount(deptName: string): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      "SELECT COUNT(*) as count FROM users WHERE department = ? AND role = 'student' AND is_active = TRUE",
      [deptName]
    );
    return rows[0].count;
  }

  static async getTeacherCount(deptName: string): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      "SELECT COUNT(*) as count FROM users WHERE department = ? AND role = 'teacher' AND is_active = TRUE",
      [deptName]
    );
    return rows[0].count;
  }
}
