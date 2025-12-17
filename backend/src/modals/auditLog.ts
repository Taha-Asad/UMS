import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

/* ======================================================
   ROW TYPE (ONLY for SELECT results)
   ====================================================== */
export interface AuditLogRow extends RowDataPacket {
  audit_id: number;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  user_id?: number | null;
  record_id?: number | null;
  old_values?: unknown;
  new_values?: unknown;
  ip_address?: string | null;
  user_agent?: string | null;
  timestamp?: Date;

  // Joined field (optional)
  user_name?: string | null;
}

/* ======================================================
   DTO (for INSERT)
   ====================================================== */
export interface CreateAuditLogDTO {
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  user_id?: number | null;
  record_id?: number | null;
  old_values?: unknown;
  new_values?: unknown;
  ip_address?: string | null;
  user_agent?: string | null;
}

/* ======================================================
   STATS ROW TYPE
   ====================================================== */
export interface StatsRow extends RowDataPacket {
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  count: number;
  date: string;
}

/* ======================================================
   MODEL
   ====================================================== */
export class AuditLogModel {
  /* ---------- Create log ---------- */
  static async log(auditData: CreateAuditLogDTO): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO audit_log (
        table_name, operation, user_id, record_id,
        old_values, new_values, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auditData.table_name,
        auditData.operation,
        auditData.user_id ?? null,
        auditData.record_id ?? null,
        auditData.old_values ? JSON.stringify(auditData.old_values) : null,
        auditData.new_values ? JSON.stringify(auditData.new_values) : null,
        auditData.ip_address ?? null,
        auditData.user_agent ?? null,
      ]
    );

    return result.insertId;
  }

  /* ---------- Queries ---------- */
  static async getByUser(userId: number, limit = 100): Promise<AuditLogRow[]> {
    const [rows] = await pool.execute<AuditLogRow[]>(
      `SELECT *
       FROM audit_log
       WHERE user_id = ?
       ORDER BY timestamp DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  static async getByTable(
    tableName: string,
    recordId?: number,
    limit = 100
  ): Promise<AuditLogRow[]> {
    let query = `
      SELECT *
      FROM audit_log
      WHERE table_name = ?
    `;
    const params: (string | number)[] = [tableName];

    if (recordId !== undefined) {
      query += " AND record_id = ?";
      params.push(recordId);
    }

    query += " ORDER BY timestamp DESC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.execute<AuditLogRow[]>(query, params);
    return rows;
  }

  static async getByDateRange(
    startDate: string,
    endDate: string,
    limit = 500
  ): Promise<AuditLogRow[]> {
    const [rows] = await pool.execute<AuditLogRow[]>(
      `SELECT al.*, u.full_name AS user_name
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.user_id
       WHERE al.timestamp BETWEEN ? AND ?
       ORDER BY al.timestamp DESC
       LIMIT ?`,
      [startDate, endDate, limit]
    );
    return rows;
  }

  static async getRecentActivity(limit = 50): Promise<AuditLogRow[]> {
    const [rows] = await pool.execute<AuditLogRow[]>(
      `SELECT al.*, u.full_name AS user_name
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.user_id
       ORDER BY al.timestamp DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  /* ---------- Maintenance ---------- */
  static async cleanup(daysToKeep = 90): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM audit_log
       WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysToKeep]
    );
    return result.affectedRows;
  }

  /* ---------- Maintenance ---------- */
  static async getStatsByOperation(
    startDate?: string,
    endDate?: string
  ): Promise<StatsRow[]> {
    let query = `
      SELECT
        table_name,
        operation,
        COUNT(*) AS count,
        DATE(timestamp) AS date
      FROM audit_log
    `;
    const params: (string | number)[] = [];

    if (startDate && endDate) {
      query += " WHERE timestamp BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    query +=
      " GROUP BY table_name, operation, DATE(timestamp) ORDER BY date DESC";

    const [rows] = await pool.execute<StatsRow[]>(query, params);

    return rows;
  }
}
