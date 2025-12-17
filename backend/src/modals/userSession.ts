import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { v4 as uuidv4 } from "uuid";

export interface UserSession extends RowDataPacket {
  session_id: string;
  user_id: number;
  login_time?: Date;
  last_activity?: Date;
  ip_address: string;
  user_agent?: string | null;
  is_active?: boolean;
  logout_time?: Date | null;
}

export class UserSessionModel {
  static async create(
    userId: number,
    ipAddress: string,
    userAgent?: string
  ): Promise<string> {
    const sessionId = uuidv4();

    await pool.execute<ResultSetHeader>(
      `INSERT INTO user_sessions (
        session_id, user_id, ip_address, user_agent, is_active
      ) VALUES (?, ?, ?, ?, TRUE)`,
      [sessionId, userId, ipAddress, userAgent || null]
    );

    return sessionId;
  }

  static async findById(sessionId: string): Promise<UserSession | null> {
    const [rows] = await pool.execute<UserSession[]>(
      `SELECT s.*, u.username, u.full_name, u.role
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.session_id = ?`,
      [sessionId]
    );
    return rows[0] || null;
  }

  static async validate(sessionId: string): Promise<boolean> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        is_active,
        TIMESTAMPDIFF(MINUTE, last_activity, NOW()) as inactive_minutes
       FROM user_sessions
       WHERE session_id = ?`,
      [sessionId]
    );

    if (!rows[0] || !rows[0].is_active) return false;

    // Check if session has been inactive for more than 30 minutes
    if (rows[0].inactive_minutes > 30) {
      await this.invalidate(sessionId);
      return false;
    }

    // Update last activity
    await this.updateActivity(sessionId);
    return true;
  }

  static async updateActivity(sessionId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE user_sessions SET last_activity = NOW() WHERE session_id = ? AND is_active = TRUE",
      [sessionId]
    );
    return result.affectedRows > 0;
  }

  static async invalidate(sessionId: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE user_sessions 
       SET is_active = FALSE, logout_time = NOW() 
       WHERE session_id = ?`,
      [sessionId]
    );
    return result.affectedRows > 0;
  }

  static async invalidateUserSessions(userId: number): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE user_sessions 
       SET is_active = FALSE, logout_time = NOW() 
       WHERE user_id = ? AND is_active = TRUE`,
      [userId]
    );
    return result.affectedRows;
  }

  static async getActiveSessions(userId?: number): Promise<UserSession[]> {
    let query = `
      SELECT s.*, u.username, u.full_name
      FROM user_sessions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.is_active = TRUE
    `;
    const params: any[] = [];

    if (userId) {
      query += " AND s.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY s.last_activity DESC";

    const [rows] = await pool.execute<UserSession[]>(query, params);
    return rows;
  }

  static async getUserSessionHistory(
    userId: number,
    limit = 50
  ): Promise<UserSession[]> {
    const [rows] = await pool.execute<UserSession[]>(
      `SELECT * FROM user_sessions 
       WHERE user_id = ? 
       ORDER BY login_time DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  static async cleanupExpiredSessions(): Promise<number> {
    // Invalidate sessions inactive for more than 30 minutes
    const [result1] = await pool.execute<ResultSetHeader>(
      `UPDATE user_sessions 
       SET is_active = FALSE, logout_time = NOW() 
       WHERE is_active = TRUE 
         AND TIMESTAMPDIFF(MINUTE, last_activity, NOW()) > 30`
    );

    // Delete old sessions (older than 30 days)
    const [result2] = await pool.execute<ResultSetHeader>(
      `DELETE FROM user_sessions 
       WHERE login_time < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    return result1.affectedRows + result2.affectedRows;
  }

  static async getSessionStatistics(): Promise<any> {
    const [stats] = await pool.execute<any[]>(
      `SELECT 
        COUNT(DISTINCT CASE WHEN is_active = TRUE THEN user_id END) as active_users,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_sessions,
        COUNT(DISTINCT user_id) as unique_users_today,
        COUNT(*) as total_sessions_today
       FROM user_sessions
       WHERE DATE(login_time) = CURDATE()`
    );

    const [roleStats] = await pool.execute<any[]>(
      `SELECT 
        u.role,
        COUNT(DISTINCT s.user_id) as active_users
       FROM user_sessions s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.is_active = TRUE
       GROUP BY u.role`
    );

    return {
      ...stats[0],
      byRole: roleStats,
    };
  }

  static async getSecurityEvents(userId?: number, limit = 100): Promise<any[]> {
    let query = `
      SELECT 
        s.session_id,
        s.user_id,
        u.username,
        u.full_name,
        s.login_time,
        s.logout_time,
        s.ip_address,
        s.user_agent,
        CASE 
          WHEN s.is_active = TRUE THEN 'Active'
          WHEN s.logout_time IS NOT NULL THEN 'Logged Out'
          ELSE 'Expired'
        END as status,
        TIMESTAMPDIFF(MINUTE, s.login_time, IFNULL(s.logout_time, NOW())) as session_duration_minutes
      FROM user_sessions s
      JOIN users u ON s.user_id = u.user_id
    `;
    const params: any[] = [];

    if (userId) {
      query += " WHERE s.user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY s.login_time DESC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async detectSuspiciousActivity(userId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        DATE(login_time) as date,
        COUNT(*) as login_attempts,
        COUNT(DISTINCT ip_address) as unique_ips,
        GROUP_CONCAT(DISTINCT ip_address) as ip_addresses
       FROM user_sessions
       WHERE user_id = ?
         AND login_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(login_time)
       HAVING login_attempts > 10 OR unique_ips > 3
       ORDER BY date DESC`,
      [userId]
    );
    return rows;
  }
}
