import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Assessment extends RowDataPacket {
  assessment_id: number;
  offering_id: number;
  title: string;
  type:
    | "assignment"
    | "quiz"
    | "midterm"
    | "final"
    | "project"
    | "presentation";
  total_marks: number;
  weightage?: number | null;
  due_date: Date;
  instructions?: string | null;
  is_published?: boolean;
}

export class AssessmentModel {
  static async create(assessment: Partial<Assessment>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO assessments (
        offering_id, title, type, total_marks, weightage,
        due_date, instructions, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessment.offering_id,
        assessment.title,
        assessment.type,
        assessment.total_marks,
        assessment.weightage || null,
        assessment.due_date,
        assessment.instructions || null,
        assessment.is_published || false,
      ]
    );
    return result.insertId;
  }

  static async findById(assessmentId: number): Promise<Assessment | null> {
    const [rows] = await pool.execute<Assessment[]>(
      `SELECT a.*, a.is_published as published, c.course_code, c.course_name, u.full_name as teacher_name
       FROM assessments a
       JOIN course_offerings co ON a.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       LEFT JOIN users u ON co.teacher_id = u.user_id
       WHERE a.assessment_id = ?`,
      [assessmentId]
    );
    return rows[0] || null;
  }

  static async getByOffering(
    offeringId: number,
    publishedOnly = false
  ): Promise<Assessment[]> {
    let query = `
      SELECT a.*, a.is_published as published
      FROM assessments a
      WHERE a.offering_id = ?
    `;
    const params: any[] = [offeringId];

    if (publishedOnly) {
      query += " AND a.is_published = TRUE";
    }

    query += " ORDER BY a.due_date";

    const [rows] = await pool.execute<Assessment[]>(query, params);
    return rows;
  }

  static async getUpcoming(studentId: number, days = 365): Promise<any[]> {
    // Show all published assignments for enrolled courses
    // Use days parameter to filter, but default to showing all published assignments
    const daysFilter = days && days > 0 ? days : 365;
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        a.*,
        c.course_code,
        c.course_name,
        DATEDIFF(a.due_date, NOW()) as days_remaining,
        m.marks_obtained,
        m.submission_date,
        a.is_published as published
       FROM assessments a
       JOIN course_offerings co ON a.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       JOIN enrollments e ON co.offering_id = e.offering_id
       LEFT JOIN marks m ON a.assessment_id = m.assessment_id AND m.student_id = ?
       WHERE e.student_id = ?
         AND e.status = 'enrolled'
         AND a.is_published = TRUE
         AND co.is_active = TRUE
         AND a.due_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY a.due_date ASC`,
      [studentId, studentId, daysFilter]
    );
    return rows;
  }

  static async getByTeacher(
    teacherId: number,
    semesterId?: number
  ): Promise<any[]> {
    let query = `
      SELECT 
        a.*,
        a.is_published as published,
        c.course_code,
        c.course_name,
        co.enrolled_students,
        (SELECT COUNT(*) FROM marks WHERE assessment_id = a.assessment_id) as submissions,
        (SELECT COUNT(*) FROM marks WHERE assessment_id = a.assessment_id AND graded_date IS NOT NULL) as graded
      FROM assessments a
      JOIN course_offerings co ON a.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE co.teacher_id = ?
    `;
    const params: any[] = [teacherId];

    if (semesterId) {
      query += " AND co.semester_id = ?";
      params.push(semesterId);
    }

    query += " ORDER BY a.due_date DESC";

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async publish(assessmentId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE assessments SET is_published = TRUE WHERE assessment_id = ?",
      [assessmentId]
    );
    return result.affectedRows > 0;
  }

  static async update(
    assessmentId: number,
    updates: Partial<Assessment>
  ): Promise<boolean> {
    // Only allow updates to actual table columns
    const allowedFields = [
      "offering_id",
      "title",
      "type",
      "description",
      "total_marks",
      "due_date",
      "instructions",
      "is_published",
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates && updates[field as keyof Assessment] !== undefined) {
        filteredUpdates[field] = updates[field as keyof Assessment];
      }
    }

    // Handle published -> is_published mapping
    if ("published" in updates && updates.published !== undefined) {
      filteredUpdates.is_published = updates.published;
    }

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE assessments SET ${setClause} WHERE assessment_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      assessmentId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(assessmentId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM assessments WHERE assessment_id = ?",
      [assessmentId]
    );
    return result.affectedRows > 0;
  }

  static async getWeightageTotal(offeringId: number): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      "SELECT COALESCE(SUM(weightage), 0) as total FROM assessments WHERE offering_id = ?",
      [offeringId]
    );
    return rows[0].total;
  }

  static async getStatistics(assessmentId: number): Promise<any> {
    const [stats] = await pool.execute<any[]>(
      `SELECT 
        COUNT(*) as total_students,
        COUNT(m.mark_id) as submissions,
        AVG(m.marks_obtained) as average_marks,
        MAX(m.marks_obtained) as highest_marks,
        MIN(m.marks_obtained) as lowest_marks,
        STD(m.marks_obtained) as std_deviation
       FROM enrollments e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN assessments a ON co.offering_id = a.offering_id
       LEFT JOIN marks m ON a.assessment_id = m.assessment_id AND e.student_id = m.student_id
       WHERE a.assessment_id = ? AND e.status = 'enrolled'`,
      [assessmentId]
    );
    return stats[0];
  }
}
