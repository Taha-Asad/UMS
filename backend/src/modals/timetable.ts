import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Timetable extends RowDataPacket {
  schedule_id: number;
  offering_id: number;
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  start_time: string;
  end_time: string;
  room_number: string;
}

export class TimetableModel {
  static async create(schedule: Partial<Timetable>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO timetable (
        offering_id, day_of_week, start_time, end_time, room_number
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        schedule.offering_id,
        schedule.day_of_week,
        schedule.start_time,
        schedule.end_time,
        schedule.room_number,
      ]
    );
    return result.insertId;
  }

  static async findById(scheduleId: number): Promise<Timetable | null> {
    const [rows] = await pool.execute<Timetable[]>(
      `SELECT t.*, c.course_code, c.course_name, u.full_name as teacher_name
       FROM timetable t
       JOIN course_offerings co ON t.offering_id = co.offering_id
       JOIN courses c ON co.course_id = c.course_id
       LEFT JOIN users u ON co.teacher_id = u.user_id
       WHERE t.schedule_id = ?`,
      [scheduleId]
    );
    return rows[0] || null;
  }

  static async getByOffering(offeringId: number): Promise<Timetable[]> {
    const [rows] = await pool.execute<Timetable[]>(
      `SELECT * FROM timetable 
       WHERE offering_id = ?
       ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), start_time`,
      [offeringId]
    );
    return rows;
  }

  static async getByRoom(
    roomNumber: string,
    semesterId?: number
  ): Promise<Timetable[]> {
    let query = `
      SELECT t.*, c.course_code, c.course_name, u.full_name as teacher_name
      FROM timetable t
      JOIN course_offerings co ON t.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      LEFT JOIN users u ON co.teacher_id = u.user_id
      WHERE t.room_number = ?
    `;
    const params: any[] = [roomNumber];

    if (semesterId) {
      query += " AND co.semester_id = ?";
      params.push(semesterId);
    }

    query +=
      " ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), start_time";

    const [rows] = await pool.execute<Timetable[]>(query, params);
    return rows;
  }

  static async getStudentTimetable(
    studentId: number,
    semesterId?: number
  ): Promise<any[]> {
    let query = `
      SELECT 
        t.schedule_id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room_number,
        c.course_code,
        c.course_name,
        u.full_name as teacher_name
      FROM timetable t
      JOIN course_offerings co ON t.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN enrollments e ON co.offering_id = e.offering_id
      LEFT JOIN users u ON co.teacher_id = u.user_id
      WHERE e.student_id = ? AND e.status = 'enrolled' AND co.is_active = TRUE
    `;
    const params: any[] = [studentId];

    if (semesterId) {
      query += " AND co.semester_id = ?";
      params.push(semesterId);
    }
    // Removed strict current semester filter - show all enrolled courses with timetables

    query +=
      " ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time";

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async getTeacherTimetable(
    teacherId: number,
    semesterId?: number
  ): Promise<any[]> {
    let query = `
      SELECT 
        t.schedule_id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room_number,
        c.course_code,
        c.course_name,
        co.enrolled_students
      FROM timetable t
      JOIN course_offerings co ON t.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE co.teacher_id = ? AND co.is_active = TRUE
    `;
    const params: any[] = [teacherId];

    if (semesterId) {
      query += " AND co.semester_id = ?";
      params.push(semesterId);
    } else {
      query +=
        " AND co.semester_id = (SELECT semester_id FROM semesters WHERE is_current = TRUE LIMIT 1)";
    }

    query +=
      " ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time";

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async checkRoomAvailability(
    roomNumber: string,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    excludeScheduleId?: number
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM timetable
      WHERE room_number = ?
        AND day_of_week = ?
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `;
    const params: (string | number)[] = [
      roomNumber,
      dayOfWeek,
      endTime,
      startTime,
      startTime,
      startTime,
      startTime,
      endTime,
    ];

    if (excludeScheduleId) {
      query += " AND schedule_id != ?";
      params.push(excludeScheduleId);
    }

    const [rows] = await pool.execute<any[]>(query, params);
    return rows[0].count === 0;
  }

  static async update(
    scheduleId: number,
    updates: Partial<Timetable>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE timetable SET ${setClause} WHERE schedule_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      scheduleId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(scheduleId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM timetable WHERE schedule_id = ?",
      [scheduleId]
    );
    return result.affectedRows > 0;
  }

  static async deleteByOffering(offeringId: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM timetable WHERE offering_id = ?",
      [offeringId]
    );
    return result.affectedRows;
  }
}
