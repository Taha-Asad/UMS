import { pool, withTransaction } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Mark extends RowDataPacket {
  mark_id: number;
  assessment_id: number;
  student_id: number;
  marks_obtained?: number | null;
  submission_date?: Date | null;
  graded_date?: Date | null;
  graded_by?: number | null;
  feedback?: string | null;
}

export class MarkModel {
  static async create(mark: Partial<Mark>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO marks (
        assessment_id, student_id, marks_obtained,
        submission_date, graded_date, graded_by, feedback
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        mark.assessment_id,
        mark.student_id,
        mark.marks_obtained || null,
        mark.submission_date || new Date(),
        mark.graded_date || null,
        mark.graded_by || null,
        mark.feedback || null,
      ]
    );
    return result.insertId;
  }

  static async findById(markId: number): Promise<Mark | null> {
    const [rows] = await pool.execute<Mark[]>(
      `SELECT m.*, 
              u.full_name as student_name, 
              u.roll_number,
              a.title as assessment_title,
              a.type as assessment_type,
              a.total_marks
       FROM marks m
       JOIN users u ON m.student_id = u.user_id
       JOIN assessments a ON m.assessment_id = a.assessment_id
       WHERE m.mark_id = ?`,
      [markId]
    );
    return rows[0] || null;
  }

  static async getByAssessment(assessmentId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        m.*,
        u.full_name as student_name,
        u.roll_number,
        CASE 
          WHEN m.marks_obtained IS NULL THEN 'Not Submitted'
          WHEN m.graded_date IS NULL THEN 'Pending Grading'
          ELSE 'Graded'
        END as status
       FROM marks m
       JOIN users u ON m.student_id = u.user_id
       WHERE m.assessment_id = ?
       ORDER BY u.roll_number`,
      [assessmentId]
    );
    return rows;
  }

  static async getByStudent(
    studentId: number,
    offeringId?: number
  ): Promise<any[]> {
    let query = `
      SELECT 
        m.*,
        a.title,
        a.type,
        a.total_marks,
        a.weightage,
        a.due_date,
        c.course_code,
        c.course_name,
        (m.marks_obtained / a.total_marks * 100) as percentage
      FROM marks m
      JOIN assessments a ON m.assessment_id = a.assessment_id
      JOIN course_offerings co ON a.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE m.student_id = ?
    `;
    const params: any[] = [studentId];

    if (offeringId) {
      query += " AND co.offering_id = ?";
      params.push(offeringId);
    }

    query += " ORDER BY a.due_date DESC";

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async submitAssignment(
    assessmentId: number,
    studentId: number,
    submissionData?: string
  ): Promise<number> {
    const [existing] = await pool.execute<any[]>(
      "SELECT mark_id FROM marks WHERE assessment_id = ? AND student_id = ?",
      [assessmentId, studentId]
    );

    if (existing[0]) {
      // Update existing submission
      await pool.execute(
        "UPDATE marks SET submission_date = NOW(), feedback = ? WHERE mark_id = ?",
        [submissionData || "Submitted", existing[0].mark_id]
      );
      return existing[0].mark_id;
    } else {
      // Create new submission
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO marks (assessment_id, student_id, submission_date, feedback)
         VALUES (?, ?, NOW(), ?)`,
        [assessmentId, studentId, submissionData || "Submitted"]
      );
      return result.insertId;
    }
  }

  static async gradeSubmission(
    markId: number,
    marksObtained: number,
    gradedBy: number,
    feedback?: string
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE marks 
       SET marks_obtained = ?,
           graded_date = NOW(),
           graded_by = ?,
           feedback = ?
       WHERE mark_id = ?`,
      [marksObtained, gradedBy, feedback || null, markId]
    );
    return result.affectedRows > 0;
  }

  static async bulkGrade(
    assessmentId: number,
    grades: Array<{ student_id: number; marks: number; feedback?: string }>,
    gradedBy: number
  ): Promise<number> {
    return withTransaction(async (connection) => {
      let affectedCount = 0;

      for (const grade of grades) {
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO marks (assessment_id, student_id, marks_obtained, graded_date, graded_by, feedback)
           VALUES (?, ?, ?, NOW(), ?, ?)
           ON DUPLICATE KEY UPDATE
           marks_obtained = VALUES(marks_obtained),
           graded_date = VALUES(graded_date),
           graded_by = VALUES(graded_by),
           feedback = VALUES(feedback)`,
          [
            assessmentId,
            grade.student_id,
            grade.marks,
            gradedBy,
            grade.feedback || null,
          ]
        );
        affectedCount += result.affectedRows;
      }

      return affectedCount;
    });
  }

  static async getUngraded(teacherId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        m.mark_id,
        m.submission_date,
        u.full_name as student_name,
        u.roll_number,
        a.title as assessment_title,
        a.type,
        c.course_code,
        c.course_name
       FROM marks m
       JOIN users u ON m.student_id = u.user_id
       JOIN assessments a ON m.assessment_id = a.assessment_id
       JOIN course_offerings co ON a.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       WHERE co.teacher_id = ?
         AND m.submission_date IS NOT NULL
         AND m.graded_date IS NULL
       ORDER BY m.submission_date`,
      [teacherId]
    );
    return rows;
  }

  static async calculateFinalGrade(
    studentId: number,
    offeringId: number
  ): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        SUM((m.marks_obtained / a.total_marks) * a.weightage) as final_grade
       FROM marks m
       JOIN assessments a ON m.assessment_id = a.assessment_id
       WHERE m.student_id = ?
         AND a.offering_id = ?
         AND m.marks_obtained IS NOT NULL`,
      [studentId, offeringId]
    );

    const finalGrade = rows[0]?.final_grade || 0;

    // Update enrollment with final marks
    await pool.execute(
      "UPDATE enrollments SET marks = ? WHERE student_id = ? AND offering_id = ?",
      [finalGrade, studentId, offeringId]
    );

    return finalGrade;
  }

  static async getClassPerformance(assessmentId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        CASE 
          WHEN m.marks_obtained >= 90 THEN 'A+'
          WHEN m.marks_obtained >= 85 THEN 'A'
          WHEN m.marks_obtained >= 80 THEN 'B+'
          WHEN m.marks_obtained >= 75 THEN 'B'
          WHEN m.marks_obtained >= 70 THEN 'C+'
          WHEN m.marks_obtained >= 65 THEN 'C'
          WHEN m.marks_obtained >= 60 THEN 'D'
          ELSE 'F'
        END as grade,
        COUNT(*) as count
       FROM marks m
       WHERE m.assessment_id = ?
         AND m.marks_obtained IS NOT NULL
       GROUP BY grade
       ORDER BY FIELD(grade, 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F')`,
      [assessmentId]
    );
    return rows;
  }
}
