import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Semester extends RowDataPacket {
  semester_id: number;
  semester_name: string;
  academic_year: string;
  start_date: Date;
  end_date: Date;
  registration_start?: Date | null;
  registration_end?: Date | null;
  is_current?: boolean;
  created_at?: Date;
}

export class SemesterModel {
  static async create(semester: Partial<Semester>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO semesters (
        semester_name, academic_year, start_date, end_date,
        registration_start, registration_end, is_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        semester.semester_name,
        semester.academic_year,
        semester.start_date,
        semester.end_date,
        semester.registration_start || null,
        semester.registration_end || null,
        semester.is_current || false,
      ]
    );
    return result.insertId;
  }

  static async findById(semesterId: number): Promise<Semester | null> {
    const [rows] = await pool.execute<Semester[]>(
      "SELECT * FROM semesters WHERE semester_id = ?",
      [semesterId]
    );
    return rows[0] || null;
  }

  static async getCurrentSemester(): Promise<Semester | null> {
    const [rows] = await pool.execute<Semester[]>(
      "SELECT * FROM semesters WHERE is_current = TRUE LIMIT 1"
    );
    return rows[0] || null;
  }

  static async getAll(): Promise<Semester[]> {
    const [rows] = await pool.execute<Semester[]>(
      "SELECT * FROM semesters ORDER BY start_date DESC"
    );
    return rows;
  }

  static async setCurrentSemester(semesterId: number): Promise<boolean> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Remove current flag from all semesters
      await connection.execute("UPDATE semesters SET is_current = FALSE");

      // Set new current semester
      const [result] = await connection.execute<ResultSetHeader>(
        "UPDATE semesters SET is_current = TRUE WHERE semester_id = ?",
        [semesterId]
      );

      await connection.commit();
      connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async update(
    semesterId: number,
    updates: Partial<Semester>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE semesters SET ${setClause} WHERE semester_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      semesterId,
    ]);
    return result.affectedRows > 0;
  }

  static async isRegistrationOpen(semesterId: number): Promise<boolean> {
    const [rows] = await pool.execute<any[]>(
      `SELECT COUNT(*) as count FROM semesters 
       WHERE semester_id = ? 
         AND registration_start <= NOW() 
         AND registration_end >= NOW()`,
      [semesterId]
    );
    return rows[0].count > 0;
  }
}
