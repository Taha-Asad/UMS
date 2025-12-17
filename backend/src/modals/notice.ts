import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Notice extends RowDataPacket {
  notice_id: number;
  title: string;
  content: string;
  category?: "academic" | "exam" | "event" | "holiday" | "urgent" | "general";
  posted_by: number;
  target_audience?: "all" | "students" | "teachers" | "staff" | "department";
  department_id?: number | null;
  attachment_url?: string | null;
  is_important?: boolean;
  expiry_date?: Date | null;
  view_count?: number;
  created_at?: Date;
}

export class NoticeModel {
  static async create(notice: Partial<Notice>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO notices (
        title, content, category, posted_by, target_audience,
        department_id, attachment_url, is_important, expiry_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notice.title,
        notice.content,
        notice.category || "general",
        notice.posted_by,
        notice.target_audience || "all",
        notice.department_id || null,
        notice.attachment_url || null,
        notice.is_important || false,
        notice.expiry_date || null,
      ]
    );
    return result.insertId;
  }

  static async findById(noticeId: number): Promise<Notice | null> {
    // Increment view count
    await pool.execute(
      "UPDATE notices SET view_count = view_count + 1 WHERE notice_id = ?",
      [noticeId]
    );

    const [rows] = await pool.execute<Notice[]>(
      `SELECT n.*, u.full_name as posted_by_name, d.dept_name
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       LEFT JOIN departments d ON n.department_id = d.dept_id
       WHERE n.notice_id = ?`,
      [noticeId]
    );
    return rows[0] || null;
  }

  static async getActive(
    userRole?: string,
    departmentId?: number
  ): Promise<Notice[]> {
    let query = `
      SELECT n.*, u.full_name as posted_by_name
      FROM notices n
      JOIN users u ON n.posted_by = u.user_id
      WHERE (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
    `;
    const params: any[] = [];

    if (userRole) {
      query += ` AND (n.target_audience = 'all' OR n.target_audience = ?)`;
      params.push(
        userRole === "student"
          ? "students"
          : userRole === "teacher"
          ? "teachers"
          : "staff"
      );
    }

    if (departmentId) {
      query += ` AND (n.department_id IS NULL OR n.department_id = ?)`;
      params.push(departmentId);
    }

    query += " ORDER BY n.is_important DESC, n.created_at DESC LIMIT 50";

    const [rows] = await pool.execute<Notice[]>(query, params);
    return rows;
  }

  static async getImportant(): Promise<Notice[]> {
    const [rows] = await pool.execute<Notice[]>(
      `SELECT n.*, u.full_name as posted_by_name
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       WHERE n.is_important = TRUE
         AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
       ORDER BY n.created_at DESC
       LIMIT 10`
    );
    return rows;
  }

  static async update(
    noticeId: number,
    updates: Partial<Notice>
  ): Promise<boolean> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE notices SET ${setClause} WHERE notice_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      noticeId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(noticeId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM notices WHERE notice_id = ?",
      [noticeId]
    );
    return result.affectedRows > 0;
  }

  static async search(searchTerm: string): Promise<Notice[]> {
    const [rows] = await pool.execute<Notice[]>(
      `SELECT n.*, u.full_name as posted_by_name
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       WHERE (n.title LIKE ? OR n.content LIKE ?)
         AND (n.expiry_date IS NULL OR n.expiry_date >= CURDATE())
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }
}
