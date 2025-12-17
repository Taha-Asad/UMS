import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Attendance extends RowDataPacket {
  attendance_id: number;
  enrollment_id: number;
  date: Date;
  status?: "present" | "absent" | "late" | "excused";
  marked_at?: Date;
  marked_by?: number | null;
  remarks?: string | null;
}

export interface AttendanceData {
  student_id: number;
  status: "present" | "absent" | "late" | "excused";
}

export class AttendanceModel {
  static async markAttendance(
    offeringId: number,
    date: string,
    markedBy: number,
    attendanceData: AttendanceData[]
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const data of attendanceData) {
        // Handle both studentId (from frontend) and student_id
        const studentId = (data as any).studentId || data.student_id;
        
        if (!studentId) {
          throw new Error("Student ID is required for each attendance record");
        }

        // Get enrollment_id
        const [enrollment] = await connection.execute<any[]>(
          `SELECT enrollment_id FROM enrollments 
           WHERE student_id = ? AND offering_id = ? AND status = 'enrolled'`,
          [studentId, offeringId]
        );

        if (enrollment[0]) {
          await connection.execute(
            `INSERT INTO attendance (enrollment_id, date, status, marked_by)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             status = VALUES(status), 
             marked_by = VALUES(marked_by),
             marked_at = NOW()`,
            [enrollment[0].enrollment_id, date, data.status, markedBy]
          );
        }
      }

      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async getByEnrollment(enrollmentId: number): Promise<Attendance[]> {
    const [rows] = await pool.execute<Attendance[]>(
      "SELECT * FROM attendance WHERE enrollment_id = ? ORDER BY date",
      [enrollmentId]
    );
    return rows;
  }

  static async getByDate(offeringId: number, date: string): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT a.*, e.student_id, u.full_name, u.roll_number
       FROM attendance a
       JOIN enrollments e ON a.enrollment_id = e.enrollment_id
       JOIN users u ON e.student_id = u.user_id
       WHERE e.offering_id = ? AND a.date = ?
       ORDER BY u.roll_number`,
      [offeringId, date]
    );
    return rows;
  }

  static async getStudentAttendance(
    studentId: number,
    offeringId: number
  ): Promise<{ total: number; present: number; percentage: number }> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) as present
       FROM attendance a
       JOIN enrollments e ON a.enrollment_id = e.enrollment_id
       WHERE e.student_id = ? AND e.offering_id = ?`,
      [studentId, offeringId]
    );

    const { total, present } = rows[0];
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { total, present, percentage };
  }

  static async getCourseAttendanceStats(offeringId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
         u.user_id, u.full_name, u.roll_number,
         COUNT(a.attendance_id) as total_classes,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
         SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
         SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
         ROUND(
           (SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) * 100.0) / 
           NULLIF(COUNT(a.attendance_id), 0), 2
         ) as attendance_percentage
       FROM enrollments e
       JOIN users u ON e.student_id = u.user_id
       LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
       WHERE e.offering_id = ? AND e.status = 'enrolled'
       GROUP BY u.user_id, u.full_name, u.roll_number
       ORDER BY u.roll_number`,
      [offeringId]
    );
    return rows;
  }

  static async update(
    attendanceId: number,
    updates: Partial<Attendance>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE attendance SET ${setClause}, marked_at = NOW() WHERE attendance_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      attendanceId,
    ]);
    return result.affectedRows > 0;
  }
}
