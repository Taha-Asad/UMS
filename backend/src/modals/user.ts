import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import bcrypt from "bcryptjs";

/* ======================================================
   ROW TYPE (SELECT ONLY)
   ====================================================== */
export interface UserRow extends RowDataPacket {
  user_id: number;
  username: string;
  password_hash: string;
  email: string;
  full_name: string;
  role: "admin" | "teacher" | "student" | "staff" | "librarian";
  gender: "male" | "female" | "other";
  date_of_birth: Date;
  phone: string;
  address: string;
  profile_photo?: string | null;

  roll_number?: string | null;
  department?: string | null;
  batch?: string | null;
  semester?: number;

  employee_id?: string | null;
  designation?: string | null;
  qualification?: string | null;
  salary?: number | null;
  join_date?: Date | null;

  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

/* ======================================================
   DTOs
   ====================================================== */
export interface CreateUserDTO {
  username: string;
  password_hash: string;
  email: string;
  full_name: string;
  role: UserRow["role"];
  gender: UserRow["gender"];
  date_of_birth: Date;
  phone: string;
  address: string;

  profile_photo?: string | null;

  roll_number?: string | null;
  department?: string | null;
  batch?: string | null;
  semester?: number;

  employee_id?: string | null;
  designation?: string | null;
  qualification?: string | null;
  salary?: number | null;
  join_date?: Date | null;

  is_active?: boolean;
}

export type UpdateUserDTO = Partial<
  Omit<UserRow, "user_id" | "created_at" | "updated_at" | "password_hash">
> & {
  password_hash?: string;
};

/* ======================================================
   MODEL
   ====================================================== */
export class UserModel {
  /* ---------- Password ---------- */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async validatePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /* ---------- Create ---------- */
  static async create(user: CreateUserDTO): Promise<number> {
    const hash = await this.hashPassword(user.password_hash);

    if (user.role === "student" && !user.roll_number) {
      throw new Error("Roll number is required for students");
    }

    if (
      ["teacher", "staff", "librarian"].includes(user.role) &&
      !user.employee_id
    ) {
      throw new Error("Employee ID is required");
    }

    let rollNumber =
      user.roll_number && user.roll_number.trim() !== ""
        ? user.roll_number
        : null;

    let employeeId =
      user.employee_id && user.employee_id.trim() !== ""
        ? user.employee_id
        : null;
    if (user.role !== "student") {
      rollNumber = null;
    }

    if (!["teacher", "staff", "librarian"].includes(user.role)) {
      employeeId = null;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users (
        username, password_hash, email, full_name, role, gender,
        date_of_birth, phone, address, profile_photo,
        roll_number, employee_id, department, batch, semester,
        designation, qualification, salary, join_date, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.username,
        hash,
        user.email,
        user.full_name,
        user.role,
        user.gender,
        user.date_of_birth,
        user.phone,
        user.address,
        user.profile_photo ?? null,
        rollNumber,
        employeeId,
        user.department ?? null,
        user.batch ?? null,
        user.semester ?? 1,
        user.designation ?? null,
        user.qualification ?? null,
        user.salary ?? null,
        user.join_date ?? null,
        user.is_active ?? true,
      ]
    );

    return result.insertId;
  }

  /* ---------- Read ---------- */
  static async findById(id: number): Promise<UserRow | null> {
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT * FROM users WHERE user_id = ?",
      [id]
    );
    return rows[0] ?? null;
  }
  static async findByEmail(email: string) {
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0] ?? null;
  }

  static async findByUsername(username: string) {
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0] ?? null;
  }
  static async handleFailedLogin(userId: number): Promise<void> {
    await pool.execute(
      `
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1,
        account_locked_until =
          CASE
            WHEN failed_login_attempts >= 4
            THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            ELSE account_locked_until
          END
    WHERE user_id = ?
    `,
      [userId]
    );
  }
  static async resetFailedAttempts(userId: number): Promise<void> {
    await pool.execute(
      `
    UPDATE users
    SET failed_login_attempts = 0,
        account_locked_until = NULL,
        last_login = NOW()
    WHERE user_id = ?
    `,
      [userId]
    );
  }

  /* ---------- Lists ---------- */
  static async getAllStudents(limit = 100, offset = 0): Promise<UserRow[]> {
    const lim = Number(limit) || 100;
    const off = Number(offset) || 0;
    // Use query() instead of execute() for LIMIT/OFFSET
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM users
       WHERE role = 'student' AND is_active = TRUE
       LIMIT ? OFFSET ?`,
      [lim, off]
    );
    return rows;
  }

  static async getAllTeachers(limit = 100, offset = 0): Promise<UserRow[]> {
    const lim = Number(limit) || 100;
    const off = Number(offset) || 0;
    // Use query() instead of execute() for LIMIT/OFFSET
    const [rows] = await pool.query<UserRow[]>(
      `SELECT * FROM users
       WHERE role = 'teacher' AND is_active = TRUE
       LIMIT ? OFFSET ?`,
      [lim, off]
    );
    return rows;
  }

  /* ---------- Search ---------- */
  static async search(query: string, role?: string): Promise<UserRow[]> {
    let sql = `
      SELECT * FROM users
      WHERE (username LIKE ? OR full_name LIKE ? OR email LIKE ?)
    `;
    const params: (string | number)[] = [
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
    ];

    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }

    const [rows] = await pool.execute<UserRow[]>(sql, params);
    return rows;
  }

  /* ---------- Update ---------- */
  static async update(
    userId: number,
    updates: UpdateUserDTO
  ): Promise<boolean> {
    if (!Object.keys(updates).length) return false;

    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key === "password_hash" && typeof value === "string") {
        fields.push("password_hash = ?");
        values.push(await this.hashPassword(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")}, updated_at = NOW()
       WHERE user_id = ?`,
      [...values, userId]
    );

    return result.affectedRows > 0;
  }

  /* ---------- Soft delete ---------- */
  static async delete(userId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE users SET is_active = FALSE WHERE user_id = ?",
      [userId]
    );
    return result.affectedRows > 0;
  }

  /* ---------- Stats ---------- */
  static async countByRole(role: UserRow["role"]): Promise<number> {
    const [rows] = await pool.execute<(RowDataPacket & { count: number })[]>(
      "SELECT COUNT(*) AS count FROM users WHERE role = ?",
      [role]
    );

    return rows[0].count;
  }
}
