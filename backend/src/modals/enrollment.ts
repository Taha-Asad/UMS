import { pool, withTransaction } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Enrollment extends RowDataPacket {
  enrollment_id: number;
  student_id: number;
  offering_id: number;
  enrollment_date?: Date;
  status?: "enrolled" | "dropped" | "completed" | "failed";
  grade?: string | null;
  grade_points?: number | null;
  marks?: number | null;
}

export class EnrollmentModel {
  static async create(
    studentId: number,
    offeringId: number
  ): Promise<number | null> {
    return withTransaction(async (connection) => {
      // Check if student can enroll
      const [checks] = await connection.execute<any[]>(
        `SELECT 
          u.semester as student_semester,
          c.semester as course_semester,
          co.max_students,
          co.enrolled_students,
          (SELECT COUNT(*) FROM enrollments e2 
           JOIN course_offerings co2 ON e2.offering_id = co2.offering_id
           WHERE e2.student_id = ? AND e2.status = 'enrolled' 
             AND co2.semester_id = co.semester_id) as current_courses
         FROM course_offerings co
         JOIN courses c ON co.course_id = c.course_id
         JOIN users u ON u.user_id = ?
         WHERE co.offering_id = ?`,
        [studentId, studentId, offeringId]
      );

      const check = checks[0];
      if (!check) throw new Error("Invalid offering or student");

      if (check.course_semester > check.student_semester) {
        throw new Error("Cannot enroll in higher semester course");
      }

      if (check.enrolled_students >= check.max_students) {
        throw new Error("Course is full");
      }

      if (check.current_courses >= 6) {
        throw new Error("Maximum courses limit reached");
      }

      // Check if already enrolled
      const [existing] = await connection.execute<any[]>(
        `SELECT COUNT(*) as count FROM enrollments 
         WHERE student_id = ? AND offering_id = ? AND status IN ('enrolled', 'completed')`,
        [studentId, offeringId]
      );

      if (existing[0].count > 0) {
        throw new Error("Already enrolled in this course");
      }

      // Create enrollment
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO enrollments (student_id, offering_id, status)
         VALUES (?, ?, 'enrolled')`,
        [studentId, offeringId]
      );

      // Update enrolled count (trigger should handle this, but we can do it explicitly)
      await connection.execute(
        `UPDATE course_offerings 
         SET enrolled_students = enrolled_students + 1
         WHERE offering_id = ?`,
        [offeringId]
      );

      return result.insertId;
    });
  }

  static async findById(enrollmentId: number): Promise<Enrollment | null> {
    const [rows] = await pool.execute<Enrollment[]>(
      `SELECT e.*, u.full_name as student_name, u.roll_number,
              c.course_code, c.course_name
       FROM enrollments e
       JOIN users u ON e.student_id = u.user_id
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       WHERE e.enrollment_id = ?`,
      [enrollmentId]
    );
    return rows[0] || null;
  }

  static async getByStudent(
    studentId: number,
    status?: string
  ): Promise<Enrollment[]> {
    let query = `
      SELECT e.*, c.course_code, c.course_name, c.credits,
             s.semester_name, u.full_name as teacher_name
      FROM enrollments e
      JOIN course_offerings co ON e.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN semesters s ON co.semester_id = s.semester_id
      LEFT JOIN users u ON co.teacher_id = u.user_id
      WHERE e.student_id = ?
    `;
    const params: any[] = [studentId];

    if (status) {
      query += " AND e.status = ?";
      params.push(status);
    }

    query += " ORDER BY s.start_date DESC, c.course_code";

    const [rows] = await pool.execute<Enrollment[]>(query, params);
    return rows;
  }

  static async getByCourse(offeringId: number): Promise<Enrollment[]> {
    const [rows] = await pool.execute<Enrollment[]>(
      `SELECT e.*, u.full_name as student_name, u.roll_number
       FROM enrollments e
       JOIN users u ON e.student_id = u.user_id
       WHERE e.offering_id = ? AND e.status = 'enrolled'
       ORDER BY u.roll_number`,
      [offeringId]
    );
    return rows;
  }

  static async dropCourse(enrollmentId: number): Promise<boolean> {
    return withTransaction(async (connection) => {
      // Get offering_id first
      const [enrollment] = await connection.execute<any[]>(
        "SELECT offering_id FROM enrollments WHERE enrollment_id = ? AND status = 'enrolled'",
        [enrollmentId]
      );

      if (!enrollment[0]) return false;

      // Update enrollment status
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE enrollments SET status = 'dropped' WHERE enrollment_id = ?`,
        [enrollmentId]
      );

      // Decrement enrolled count
      await connection.execute(
        `UPDATE course_offerings 
         SET enrolled_students = GREATEST(enrolled_students - 1, 0)
         WHERE offering_id = ?`,
        [enrollment[0].offering_id]
      );

      return result.affectedRows > 0;
    });
  }

  static async updateGrade(
    enrollmentId: number,
    marks: number
  ): Promise<boolean> {
    // Calculate grade based on marks
    let grade: string;
    let gradePoints: number;
    let status: string;

    if (marks >= 90) {
      grade = "A+";
      gradePoints = 4.0;
    } else if (marks >= 85) {
      grade = "A";
      gradePoints = 3.75;
    } else if (marks >= 80) {
      grade = "B+";
      gradePoints = 3.5;
    } else if (marks >= 75) {
      grade = "B";
      gradePoints = 3.0;
    } else if (marks >= 70) {
      grade = "C+";
      gradePoints = 2.5;
    } else if (marks >= 65) {
      grade = "C";
      gradePoints = 2.0;
    } else if (marks >= 60) {
      grade = "D";
      gradePoints = 1.0;
    } else {
      grade = "F";
      gradePoints = 0.0;
    }

    status = marks >= 60 ? "completed" : "failed";

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE enrollments 
       SET marks = ?, grade = ?, grade_points = ?, status = ?
       WHERE enrollment_id = ?`,
      [marks, grade, gradePoints, status, enrollmentId]
    );

    return result.affectedRows > 0;
  }

  static async calculateCGPA(studentId: number): Promise<number> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
         SUM(e.grade_points * c.credits) / NULLIF(SUM(c.credits), 0) as cgpa
       FROM enrollments e
       JOIN course_offerings co ON e.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       WHERE e.student_id = ? 
         AND e.status = 'completed'
         AND e.grade IS NOT NULL`,
      [studentId]
    );

    const cgpa = rows[0]?.cgpa || 0;

    // Update user's CGPA
    await pool.execute("UPDATE users SET cgpa = ? WHERE user_id = ?", [
      cgpa,
      studentId,
    ]);

    return cgpa;
  }
}
