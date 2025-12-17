import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Course extends RowDataPacket {
  course_id: number;
  course_code: string;
  course_name: string;
  department_id: number;
  credits: number;
  semester: number;
  course_type?: "core" | "elective" | "lab";
  description?: string | null;
  syllabus?: string | null;
  prerequisites?: string | null;
  is_active?: boolean;
  created_at?: Date;
}

export class CourseModel {
  static async create(course: Partial<Course>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO courses (
        course_code, course_name, department_id, credits, semester,
        course_type, description, syllabus, prerequisites, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course.course_code,
        course.course_name,
        course.department_id,
        course.credits,
        course.semester,
        course.course_type || "core",
        course.description || null,
        course.syllabus || null,
        course.prerequisites || null,
        course.is_active !== false,
      ]
    );
    return result.insertId;
  }

  static async findById(courseId: number): Promise<Course | null> {
    const [rows] = await pool.execute<Course[]>(
      `SELECT c.*, d.dept_name, d.dept_code 
       FROM courses c 
       JOIN departments d ON c.department_id = d.dept_id 
       WHERE c.course_id = ?`,
      [courseId]
    );
    return rows[0] || null;
  }

  static async findByCode(courseCode: string): Promise<Course | null> {
    const [rows] = await pool.execute<Course[]>(
      "SELECT * FROM courses WHERE course_code = ?",
      [courseCode]
    );
    return rows[0] || null;
  }

  static async getByDepartment(departmentId: number): Promise<Course[]> {
    const [rows] = await pool.execute<Course[]>(
      `SELECT * FROM courses 
       WHERE department_id = ? AND is_active = TRUE 
       ORDER BY semester, course_code`,
      [departmentId]
    );
    return rows;
  }

  static async getBySemester(
    semester: number,
    departmentId?: number
  ): Promise<Course[]> {
    let query = "SELECT * FROM courses WHERE semester = ? AND is_active = TRUE";
    const params: any[] = [semester];

    if (departmentId) {
      query += " AND department_id = ?";
      params.push(departmentId);
    }

    query += " ORDER BY course_code";

    const [rows] = await pool.execute<Course[]>(query, params);
    return rows;
  }

  static async getAll(
    limit?: number | string,
    offset?: number | string
  ): Promise<Course[]> {
    const lim = Number(limit) || 100;
    const off = Number(offset) || 0;

    // Use query() instead of execute() for LIMIT/OFFSET
    const [rows] = await pool.query<Course[]>(
      `SELECT c.*, d.dept_name, d.dept_code 
     FROM courses c 
     JOIN departments d ON c.department_id = d.dept_id 
     WHERE c.is_active = TRUE 
     ORDER BY c.course_code 
     LIMIT ? OFFSET ?`,
      [lim, off]
    );

    return rows;
  }

  static async update(
    courseId: number,
    updates: Partial<Course>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE courses SET ${setClause} WHERE course_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      courseId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(courseId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE courses SET is_active = FALSE WHERE course_id = ?",
      [courseId]
    );
    return result.affectedRows > 0;
  }

  static async search(searchTerm: string): Promise<Course[]> {
    const [rows] = await pool.execute<Course[]>(
      `SELECT c.*, d.dept_name 
       FROM courses c 
       JOIN departments d ON c.department_id = d.dept_id 
       WHERE c.is_active = TRUE 
         AND (c.course_code LIKE ? OR c.course_name LIKE ?)
       LIMIT 50`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }
}
