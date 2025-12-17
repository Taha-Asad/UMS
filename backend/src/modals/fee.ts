import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Fee extends RowDataPacket {
  fee_id: number;
  student_id: number;
  semester_id: number;
  fee_type:
    | "tuition"
    | "hostel"
    | "library"
    | "laboratory"
    | "sports"
    | "exam"
    | "other";
  amount: number;
  discount?: number;
  due_date: Date;
  paid_amount?: number;
  payment_date?: Date | null;
  payment_method?: "cash" | "bank" | "online" | "cheque" | null;
  transaction_id?: string | null;
  status?: "unpaid" | "partial" | "paid" | "overdue" | "waived";
  late_fee?: number;
  remarks?: string | null;
  created_at?: Date;
}

export class FeeModel {
  static async create(fee: Partial<Fee>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO fees (
        student_id, semester_id, fee_type, amount, discount,
        due_date, status, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fee.student_id,
        fee.semester_id,
        fee.fee_type,
        fee.amount,
        fee.discount || 0,
        fee.due_date,
        fee.status || "unpaid",
        fee.remarks || null,
      ]
    );
    return result.insertId;
  }

  static async findById(feeId: number): Promise<Fee | null> {
    const [rows] = await pool.execute<Fee[]>(
      `SELECT f.*, u.full_name, u.roll_number, s.semester_name
       FROM fees f
       JOIN users u ON f.student_id = u.user_id
       JOIN semesters s ON f.semester_id = s.semester_id
       WHERE f.fee_id = ?`,
      [feeId]
    );
    return rows[0] || null;
  }

  static async getByStudent(
    studentId: number,
    status?: string
  ): Promise<Fee[]> {
    let query = `
      SELECT f.*, s.semester_name,
             (f.amount - f.discount + f.late_fee) as total_amount,
             ((f.amount - f.discount + f.late_fee) - f.paid_amount) as balance
      FROM fees f
      JOIN semesters s ON f.semester_id = s.semester_id
      WHERE f.student_id = ?
    `;
    const params: any[] = [studentId];

    if (status) {
      query += " AND f.status = ?";
      params.push(status);
    }

    query += " ORDER BY f.due_date DESC";

    const [rows] = await pool.execute<Fee[]>(query, params);
    return rows;
  }

  static async makePayment(
    feeId: number,
    amount: number,
    paymentMethod: string,
    transactionId?: string
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current fee details
      const [fees] = await connection.execute<any[]>(
        "SELECT amount, discount, late_fee, paid_amount FROM fees WHERE fee_id = ?",
        [feeId]
      );

      if (!fees[0]) {
        throw new Error("Fee not found");
      }

      const fee = fees[0];
      const totalAmount = fee.amount - fee.discount + fee.late_fee;
      const newPaidAmount = (fee.paid_amount || 0) + amount;

      // Determine new status
      let status: string;
      if (newPaidAmount >= totalAmount) {
        status = "paid";
      } else if (newPaidAmount > 0) {
        status = "partial";
      } else {
        status = "unpaid";
      }

      // Update fee record
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE fees 
         SET paid_amount = ?,
             status = ?,
             payment_date = CASE WHEN ? = 'paid' THEN NOW() ELSE payment_date END,
             payment_method = ?,
             transaction_id = ?
         WHERE fee_id = ?`,
        [
          newPaidAmount,
          status,
          status,
          paymentMethod,
          transactionId || null,
          feeId,
        ]
      );

      await connection.commit();
      connection.release();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async updateLateFees(): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE fees 
       SET late_fee = GREATEST(late_fee, amount * 0.05),
           status = 'overdue'
       WHERE due_date < CURDATE() 
         AND status IN ('unpaid', 'partial')`
    );
    return result.affectedRows;
  }

  static async getFinancialSummary(studentId: number): Promise<any> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
         SUM(amount - discount) as total_fees,
         SUM(paid_amount) as total_paid,
         SUM(late_fee) as total_late_fees,
         SUM((amount - discount + late_fee) - paid_amount) as outstanding_balance
       FROM fees
       WHERE student_id = ?`,
      [studentId]
    );
    return rows[0];
  }

  static async getBySemester(semesterId: number): Promise<Fee[]> {
    const [rows] = await pool.execute<Fee[]>(
      `SELECT f.*, u.full_name, u.roll_number
       FROM fees f
       JOIN users u ON f.student_id = u.user_id
       WHERE f.semester_id = ?
       ORDER BY u.roll_number`,
      [semesterId]
    );
    return rows;
  }

  static async generateBulkFees(
    semesterId: number,
    feeType: string,
    amount: number,
    dueDate: string
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO fees (student_id, semester_id, fee_type, amount, due_date, status)
       SELECT u.user_id, ?, ?, ?, ?, 'unpaid'
       FROM users u
       WHERE u.role = 'student' AND u.is_active = TRUE
         AND NOT EXISTS (
           SELECT 1 FROM fees f 
           WHERE f.student_id = u.user_id 
             AND f.semester_id = ? 
             AND f.fee_type = ?
         )`,
      [semesterId, feeType, amount, dueDate, semesterId, feeType]
    );
    return result.affectedRows;
  }

  static async update(
    feeId: number,
    updates: Partial<Fee>
  ): Promise<boolean> {
    // Only allow updates to specific fields (not payment-related fields)
    const allowedFields = [
      "student_id",
      "semester_id",
      "fee_type",
      "amount",
      "discount",
      "due_date",
      "remarks",
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates && updates[field as keyof Fee] !== undefined) {
        filteredUpdates[field] = updates[field as keyof Fee];
      }
    }

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE fees SET ${setClause} WHERE fee_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      feeId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(feeId: number): Promise<boolean> {
    // Only allow deletion if fee is unpaid or partial
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM fees 
       WHERE fee_id = ? 
       AND status IN ('unpaid', 'partial')`,
      [feeId]
    );
    return result.affectedRows > 0;
  }
}
