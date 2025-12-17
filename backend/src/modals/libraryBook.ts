import { pool } from "../config/db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface LibraryBook extends RowDataPacket {
  book_id: number;
  isbn?: string | null;
  title: string;
  author: string;
  publisher?: string | null;
  edition?: string | null;
  category?: string | null;
  total_copies?: number;
  available_copies?: number;
  shelf_location?: string | null;
  is_active?: boolean;
  added_date?: Date;
}

export class LibraryBookModel {
  static async create(book: Partial<LibraryBook>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO library_books (
        isbn, title, author, publisher, edition, category,
        total_copies, available_copies, shelf_location, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.isbn || null,
        book.title,
        book.author,
        book.publisher || null,
        book.edition || null,
        book.category || null,
        book.total_copies || 1,
        book.available_copies || book.total_copies || 1,
        book.shelf_location || null,
        book.is_active !== false,
      ]
    );
    return result.insertId;
  }

  static async findById(bookId: number): Promise<LibraryBook | null> {
    const [rows] = await pool.execute<LibraryBook[]>(
      `SELECT b.*,
              (SELECT COUNT(*) FROM book_issues WHERE book_id = b.book_id AND status = 'issued') as currently_issued
       FROM library_books b
       WHERE b.book_id = ?`,
      [bookId]
    );
    return rows[0] || null;
  }

  static async findByISBN(isbn: string): Promise<LibraryBook | null> {
    const [rows] = await pool.execute<LibraryBook[]>(
      "SELECT * FROM library_books WHERE isbn = ?",
      [isbn]
    );
    return rows[0] || null;
  }

  static async search(
    searchTerm: string,
    category?: string
  ): Promise<LibraryBook[]> {
    let query = `
      SELECT * FROM library_books 
      WHERE is_active = TRUE
        AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)
    `;
    const searchPattern = `%${searchTerm}%`;
    const params: any[] = [searchPattern, searchPattern, searchPattern];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY title LIMIT 100";

    const [rows] = await pool.execute<LibraryBook[]>(query, params);
    return rows;
  }

  static async getAvailable(): Promise<LibraryBook[]> {
    const [rows] = await pool.execute<LibraryBook[]>(
      `SELECT * FROM library_books 
       WHERE available_copies > 0 AND is_active = TRUE 
       ORDER BY title`
    );
    return rows;
  }

  static async getByCategory(category: string): Promise<LibraryBook[]> {
    const [rows] = await pool.execute<LibraryBook[]>(
      `SELECT * FROM library_books 
       WHERE category = ? AND is_active = TRUE 
       ORDER BY title`,
      [category]
    );
    return rows;
  }

  static async getCategories(): Promise<string[]> {
    const [rows] = await pool.execute<any[]>(
      "SELECT DISTINCT category FROM library_books WHERE category IS NOT NULL ORDER BY category"
    );
    return rows.map((row) => row.category);
  }

  static async updateAvailability(
    bookId: number,
    change: number
  ): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE library_books 
       SET available_copies = GREATEST(0, LEAST(total_copies, available_copies + ?))
       WHERE book_id = ?`,
      [change, bookId]
    );
    return result.affectedRows > 0;
  }

  static async update(
    bookId: number,
    updates: Partial<LibraryBook>
  ): Promise<boolean> {
    // Only allow updates to actual table columns
    const allowedFields = [
      "isbn",
      "title",
      "author",
      "publisher",
      "edition",
      "category",
      "total_copies",
      "available_copies",
      "shelf_location",
      "is_active",
    ];

    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates && updates[field as keyof LibraryBook] !== undefined) {
        filteredUpdates[field] = updates[field as keyof LibraryBook];
      }
    }

    // Handle location -> shelf_location mapping
    if ("location" in updates && updates.location !== undefined) {
      filteredUpdates.shelf_location = updates.location;
    }

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);

    if (fields.length === 0) return false;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE library_books SET ${setClause} WHERE book_id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(query, [
      ...values,
      bookId,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(bookId: number): Promise<boolean> {
    // Check if book has any active issues
    const [issues] = await pool.execute<any[]>(
      "SELECT COUNT(*) as count FROM book_issues WHERE book_id = ? AND status = 'issued'",
      [bookId]
    );

    if (issues[0].count > 0) {
      // Soft delete only
      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE library_books SET is_active = FALSE WHERE book_id = ?",
        [bookId]
      );
      return result.affectedRows > 0;
    } else {
      // Hard delete if no active issues
      const [result] = await pool.execute<ResultSetHeader>(
        "DELETE FROM library_books WHERE book_id = ?",
        [bookId]
      );
      return result.affectedRows > 0;
    }
  }

  static async getPopularBooks(limit = 10): Promise<any[]> {
    const [rows] = await pool.execute<any[]>(
      `SELECT 
        b.*,
        COUNT(bi.issue_id) as times_issued
       FROM library_books b
       LEFT JOIN book_issues bi ON b.book_id = bi.book_id
       WHERE b.is_active = TRUE
       GROUP BY b.book_id
       ORDER BY times_issued DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async getStatistics(): Promise<any> {
    const [stats] = await pool.execute<any[]>(
      `SELECT 
        COUNT(DISTINCT book_id) as total_books,
        SUM(total_copies) as total_copies,
        SUM(available_copies) as available_copies,
        COUNT(DISTINCT category) as total_categories,
        (SELECT COUNT(*) FROM book_issues WHERE status = 'issued') as books_issued
       FROM library_books
       WHERE is_active = TRUE`
    );
    return stats[0];
  }
}
