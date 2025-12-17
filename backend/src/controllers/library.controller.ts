import type { Request, Response } from "express";
import { LibraryBookModel } from "../modals/libraryBook.ts";
import { BookIssueModel } from "../modals/bookIssue.ts";
import { ApiResponse } from "../utils/apiResponse.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";

export class LibraryController {
  // Add book
  addBook = asyncHandler(async (req: Request, res: Response) => {
    const bookData = req.body;

    // Check if ISBN already exists
    if (bookData.isbn) {
      const existingBook = await LibraryBookModel.findByISBN(bookData.isbn);
      if (existingBook) {
        return ApiResponse.error(
          res,
          "Book with this ISBN already exists",
          400
        );
      }
    }

    const bookId = await LibraryBookModel.create(bookData);
    const book = await LibraryBookModel.findById(bookId);

    ApiResponse.success(
      res,
      {
        message: "Book added successfully",
        book,
      },
      201
    );
  });

  // Get all books
  getBooks = asyncHandler(async (req: Request, res: Response) => {
    const { available } = req.query;

    const books =
      available === "true"
        ? await LibraryBookModel.getAvailable()
        : await LibraryBookModel.search("");

    ApiResponse.success(res, books);
  });

  // Search books
  searchBooks = asyncHandler(async (req: Request, res: Response) => {
    const { q, category } = req.query;

    if (!q) {
      return ApiResponse.error(res, "Search query is required", 400);
    }

    const books = await LibraryBookModel.search(
      q as string,
      category as string
    );
    ApiResponse.success(res, books);
  });

  // Get book by ID
  getBookById = asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id);
    const book = await LibraryBookModel.findById(bookId);

    if (!book) {
      return ApiResponse.error(res, "Book not found", 404);
    }

    ApiResponse.success(res, book);
  });

  // Update book
  updateBook = asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id);
    const updates = req.body;

    const success = await LibraryBookModel.update(bookId, updates);
    if (!success) {
      return ApiResponse.error(res, "Failed to update book", 400);
    }

    ApiResponse.success(res, { message: "Book updated successfully" });
  });

  // Delete book
  deleteBook = asyncHandler(async (req: Request, res: Response) => {
    const bookId = parseInt(req.params.id);
    const success = await LibraryBookModel.delete(bookId);

    if (!success) {
      return ApiResponse.error(res, "Failed to delete book", 400);
    }

    ApiResponse.success(res, { message: "Book deleted successfully" });
  });

  // Issue book
  issueBook = asyncHandler(async (req: Request, res: Response) => {
    const { bookId, userId, dueDays } = req.body;

    try {
      const issueId = await BookIssueModel.issueBook(bookId, userId, dueDays);

      if (!issueId) {
        return ApiResponse.error(res, "Failed to issue book", 400);
      }

      const issue = await BookIssueModel.findById(issueId);

      ApiResponse.success(
        res,
        {
          message: "Book issued successfully",
          issue,
        },
        201
      );
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  });

  // Return book
  returnBook = asyncHandler(async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);

    try {
      const success = await BookIssueModel.returnBook(issueId);

      if (!success) {
        return ApiResponse.error(res, "Failed to return book", 400);
      }

      ApiResponse.success(res, { message: "Book returned successfully" });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  });

  // Get user's issued books
  getUserBooks = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { status } = req.query;

    const books = await BookIssueModel.getByUser(userId, status as string);
    ApiResponse.success(res, books);
  });

  // Get all active issues
  getAllActiveIssues = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    let issues;
    if (status === "overdue") {
      issues = await BookIssueModel.getOverdueBooks();
    } else {
      issues = await BookIssueModel.getAllActiveIssues();
    }
    ApiResponse.success(res, issues);
  });

  // Get overdue books
  getOverdueBooks = asyncHandler(async (req: Request, res: Response) => {
    const books = await BookIssueModel.getOverdueBooks();
    ApiResponse.success(res, books);
  });

  // Renew book
  renewBook = asyncHandler(async (req: Request, res: Response) => {
    const issueId = parseInt(req.params.issueId);
    const { additionalDays = 14 } = req.body;

    try {
      const success = await BookIssueModel.renewBook(issueId, additionalDays);

      if (!success) {
        return ApiResponse.error(res, "Failed to renew book", 400);
      }

      ApiResponse.success(res, { message: "Book renewed successfully" });
    } catch (error: any) {
      return ApiResponse.error(res, error.message, 400);
    }
  });

  // Get library statistics
  getLibraryStatistics = asyncHandler(async (req: Request, res: Response) => {
    const bookStats = await LibraryBookModel.getStatistics();
    const issueStats = await BookIssueModel.getStatistics();

    ApiResponse.success(res, {
      books: bookStats,
      issues: issueStats,
    });
  });
}
