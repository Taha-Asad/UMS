import { pool, withTransaction } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface BookIssue extends RowDataPacket {
  issue_id: number;
  book_id: number;
  user_id: number;
  issue_date: Date;
  due_date: Date;
  return_date?: Date | null;
  fine_amount?: number;
  fine_paid?: boolean;
  status?: "issued" | "returned" | "lost" | "damaged";
}

export class BookIssueModel {
  static async issueBook(
    bookId: number,
    userId: number,
    dueDays = 14
  ): Promise<number | null> {
    return withTransaction(async (connection) => {
      // Check book availability
      const [books] = await connection.execute<any[]>(
        "SELECT available_copies FROM library_books WHERE book_id = ? AND is_active = TRUE",
        [bookId]
      );

      if (!books[0] || books[0].available_copies <= 0) {
        throw new Error("Book not available");
      }

      // Check if user has overdue books
      const [overdue] = await connection.execute<any[]>(
        `SELECT COUNT(*) as count 
         FROM book_issues 
         WHERE user_id = ? 
           AND status = 'issued' 
           AND due_date < CURDATE()`,
        [userId]
      );

      if (overdue[0].count > 0) {
        throw new Error("User has overdue books");
      }

      // Check max books limit (e.g., 5 books)
      const [current] = await connection.execute<any[]>(
        `SELECT COUNT(*) as count 
         FROM book_issues 
         WHERE user_id = ? AND status = 'issued'`,
        [userId]
      );

      if (current[0].count >= 5) {
        throw new Error("Maximum books limit reached");
      }

      // Issue the book
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);

      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO book_issues (book_id, user_id, issue_date, due_date, status)
         VALUES (?, ?, CURDATE(), ?, 'issued')`,
        [bookId, userId, dueDate]
      );

      // Update book availability
      await connection.execute(
        "UPDATE library_books SET available_copies = available_copies - 1 WHERE book_id = ?",
        [bookId]
      );

      return result.insertId;
    });
  }

  static async returnBook(issueId: number): Promise<boolean> {
    return withTransaction(async (connection) => {
      // Get issue details
      const [issues] = await connection.execute<any[]>(
        `SELECT book_id, due_date, status 
         FROM book_issues 
         WHERE issue_id = ? AND status = 'issued'`,
        [issueId]
      );

      if (!issues[0]) {
        throw new Error("Issue not found or already returned");
      }

      const issue = issues[0];
      const returnDate = new Date();
      let fineAmount = 0;

      // Calculate fine if overdue (Rs. 10 per day)
      if (returnDate > new Date(issue.due_date)) {
        const daysOverdue = Math.floor(
          (returnDate.getTime() - new Date(issue.due_date).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        fineAmount = daysOverdue * 10;
      }

      // Update issue record
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE book_issues 
         SET return_date = CURDATE(),
             fine_amount = ?,
             status = 'returned'
         WHERE issue_id = ?`,
        [fineAmount, issueId]
      );

      // Update book availability
      await connection.execute(
        "UPDATE library_books SET available_copies = available_copies + 1 WHERE book_id = ?",
        [issue.book_id]
      );

      return result.affectedRows > 0;
    });
  }

  static async findById(issueId: number): Promise<BookIssue | null> {
    const [rows] = await pool.execute<BookIssue[]>(
      `SELECT bi.*, 
              b.title as book_title,
              b.author,
              u.full_name as user_name,
              u.roll_number,
              u.employee_id
       FROM book_issues bi
       JOIN library_books b ON bi.book_id = b.book_id
       JOIN users u ON bi.user_id = u.user_id
       WHERE bi.issue_id = ?`,
      [issueId]
    );
    return rows[0] || null;
  }

  static async getByUser(userId: number, status?: string): Promise<any[]> {
    let query = `
      SELECT bi.*, b.title, b.author, b.isbn
      FROM book_issues bi
      JOIN library_books b ON bi.book_id = b.book_id
      WHERE bi.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      query += " AND bi.status = ?";
      params.push(status);
    }

    query += " ORDER BY bi.issue_date DESC";

    const [rows] = await pool.execute<any[]>(query, params);
    return rows;
  }

  static async getAllActiveIssues(): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        bi.*,
        b.title as book_title,
        b.author,
        u.full_name as user_name,
        u.roll_number,
        u.employee_id
       FROM book_issues bi
       JOIN library_books b ON bi.book_id = b.book_id
       JOIN users u ON bi.user_id = u.user_id
       WHERE bi.status IN ('issued', 'overdue')
       ORDER BY bi.issue_date DESC`
    );
    return rows;
  }

  static async getOverdueBooks(): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        bi.*,
        b.title as book_title,
        b.author,
        u.full_name as user_name,
        u.email,
        u.phone,
        DATEDIFF(CURDATE(), bi.due_date) as days_overdue
       FROM book_issues bi
       JOIN library_books b ON bi.book_id = b.book_id
       JOIN users u ON bi.user_id = u.user_id
       WHERE bi.status = 'issued' AND bi.due_date < CURDATE()
       ORDER BY bi.due_date`
    );
    return rows;
  }

  static async renewBook(
    issueId: number,
    additionalDays = 14
  ): Promise<boolean> {
    // Check if book can be renewed (e.g., not already renewed, no reservations)
    const [issues] = await pool.execute<any[]>(
      `SELECT due_date, 
              DATEDIFF(due_date, issue_date) as current_period
       FROM book_issues 
       WHERE issue_id = ? AND status = 'issued'`,
      [issueId]
    );

    if (!issues[0]) return false;

    // Allow renewal only once (check if already extended beyond 14 days)
    if (issues[0].current_period > 14) {
      throw new Error("Book already renewed");
    }

    const newDueDate = new Date(issues[0].due_date);
    newDueDate.setDate(newDueDate.getDate() + additionalDays);

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE book_issues SET due_date = ? WHERE issue_id = ?",
      [newDueDate, issueId]
    );

    return result.affectedRows > 0;
  }

  static async markAsLost(
    issueId: number,
    fineAmount: number
  ): Promise<boolean> {
    return withTransaction(async (connection) => {
      // Get book details
      const [issues] = await connection.execute<any[]>(
        "SELECT book_id FROM book_issues WHERE issue_id = ?",
        [issueId]
      );

      if (!issues[0]) return false;

      // Update issue status
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE book_issues 
         SET status = 'lost',
             fine_amount = ?,
             return_date = CURDATE()
         WHERE issue_id = ?`,
        [fineAmount, issueId]
      );

      // Decrease total copies of the book
      await connection.execute(
        "UPDATE library_books SET total_copies = total_copies - 1 WHERE book_id = ?",
        [issues[0].book_id]
      );

      return result.affectedRows > 0;
    });
  }

  static async payFine(issueId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE book_issues SET fine_paid = TRUE WHERE issue_id = ?",
      [issueId]
    );
    return result.affectedRows > 0;
  }

  static async getStatistics(): Promise<any> {
    const [stats] = await pool.execute<any[]>(
      `SELECT 
        COUNT(CASE WHEN status = 'issued' THEN 1 END) as books_issued,
        COUNT(CASE WHEN status = 'returned' THEN 1 END) as books_returned,
        COUNT(CASE WHEN status = 'lost' THEN 1 END) as books_lost,
        COUNT(CASE WHEN status = 'issued' AND due_date < CURDATE() THEN 1 END) as overdue_books,
        SUM(CASE WHEN fine_amount > 0 AND fine_paid = FALSE THEN fine_amount ELSE 0 END) as pending_fines,
        SUM(CASE WHEN fine_paid = TRUE THEN fine_amount ELSE 0 END) as collected_fines
       FROM book_issues`
    );
    return stats[0];
  }

  static async getIssuanceHistory(bookId: number): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        bi.*,
        u.full_name as user_name,
        u.role as user_role
       FROM book_issues bi
       JOIN users u ON bi.user_id = u.user_id
       WHERE bi.book_id = ?
       ORDER BY bi.issue_date DESC`,
      [bookId]
    );
    return rows;
  }
}
