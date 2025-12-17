import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface CourseOffering extends RowDataPacket {
  offering_id: number;
  course_id: number;
  semester_id: number;
  teacher_id?: number | null;
  room_number?: string | null;
  max_students?: number;
  enrolled_students?: number;
  is_active?: boolean;
}

export class CourseOfferingModel {
  static async create(offering: Partial<CourseOffering>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO course_offerings (
        course_id, semester_id, teacher_id, room_number,
        max_students, enrolled_students, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        offering.course_id,
        offering.semester_id,
        offering.teacher_id || null,
        offering.room_number || null,
        offering.max_students || 40,
        offering.enrolled_students || 0,
        offering.is_active !== false,
      ]
    );
    return result.insertId;
  }

  static async findById(offeringId: number): Promise<CourseOffering | null> {
    const [rows] = await pool.execute<CourseOffering[]>(
      `SELECT co.*, c.course_code, c.course_name, c.credits, 
              s.semester_name, u.full_name as teacher_name
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.course_id
       JOIN semesters s ON co.semester_id = s.semester_id
       LEFT JOIN users u ON co.teacher_id = u.user_id
       WHERE co.offering_id = ?`,
      [offeringId]
    );
    return rows[0] || null;
  }

  static async getBySemester(semesterId: number): Promise<CourseOffering[]> {
    const [rows] = await pool.execute<CourseOffering[]>(
      `SELECT co.*, c.course_code, c.course_name, c.credits, c.semester as course_semester,
              u.full_name as teacher_name
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.course_id
       LEFT JOIN users u ON co.teacher_id = u.user_id
       WHERE co.semester_id = ? AND co.is_active = TRUE
       ORDER BY c.course_code`,
      [semesterId]
    );
    return rows;
  }

  static async getByTeacher(
    teacherId: number,
    semesterId?: number
  ): Promise<CourseOffering[]> {
    let query = `
      SELECT co.*, c.course_code, c.course_name, c.credits,
             s.semester_name, co.enrolled_students
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      JOIN semesters s ON co.semester_id = s.semester_id
      WHERE co.teacher_id = ? AND co.is_active = TRUE
    `;
    const params: any[] = [teacherId];

    if (semesterId) {
      query += " AND co.semester_id = ?";
      params.push(semesterId);
    }

    query += " ORDER BY c.course_code";

    const [rows] = await pool.execute<CourseOffering[]>(query, params);
    return rows;
  }

  static async update(
    offeringId: number,
    updates: Partial<CourseOffering>
  ): Promise<boolean> {
    // Only allow updates to actual table columns (exclude joined fields)
    const allowedFields = [
      "course_id",
      "semester_id",
      "teacher_id",
      "room_number",
      "max_students",
      "enrolled_students",
      "is_active",
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates && updates[field as keyof CourseOffering] !== undefined) {
        filteredUpdates[field] = updates[field as keyof CourseOffering];
      }
    }

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE course_offerings SET ${setClause} WHERE offering_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      offeringId,
    ]);
    return result.affectedRows > 0;
  }

  static async hasCapacity(offeringId: number): Promise<boolean> {
    const [rows] = await pool.execute<any[]>(
      `SELECT (max_students > enrolled_students) as has_capacity
       FROM course_offerings
       WHERE offering_id = ?`,
      [offeringId]
    );
    return rows[0]?.has_capacity || false;
  }

  static async incrementEnrollment(offeringId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE course_offerings 
       SET enrolled_students = enrolled_students + 1
       WHERE offering_id = ? AND enrolled_students < max_students`,
      [offeringId]
    );
    return result.affectedRows > 0;
  }

  static async decrementEnrollment(offeringId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE course_offerings 
       SET enrolled_students = GREATEST(enrolled_students - 1, 0)
       WHERE offering_id = ?`,
      [offeringId]
    );
    return result.affectedRows > 0;
  }

  static async getAvailableForStudent(
    studentId: number,
    semesterId: number
  ): Promise<CourseOffering[]> {
    const [rows] = await pool.execute<CourseOffering[]>(
      `SELECT co.*, c.course_code, c.course_name, c.credits, c.semester as course_semester,
              u.full_name as teacher_name,
              (co.max_students - co.enrolled_students) as available_seats
       FROM course_offerings co
       JOIN courses c ON co.course_id = c.course_id
       LEFT JOIN users u ON co.teacher_id = u.user_id
       WHERE co.semester_id = ? 
         AND co.is_active = TRUE
         AND co.enrolled_students < co.max_students
         AND c.semester <= (SELECT semester FROM users WHERE user_id = ?)
         AND co.offering_id NOT IN (
           SELECT offering_id FROM enrollments 
           WHERE student_id = ? AND status IN ('enrolled', 'completed')
         )
       ORDER BY c.course_code`,
      [semesterId, studentId, studentId]
    );
    return rows;
  }
}
