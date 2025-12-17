import { api } from "./axios";
import type { ApiResponse } from "../types";

export interface Book {
  book_id: number;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  total_copies: number;
  available_copies: number;
  location?: string;
}

export interface BookIssue {
  issue_id: number;
  book_id: number;
  user_id: number;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: "issued" | "returned" | "overdue" | "renewed";
  fine_amount?: number;
  book_title?: string;
  user_name?: string;
}

export interface LibraryStatistics {
  total_books: number;
  total_issues: number;
  active_issues: number;
  overdue_books: number;
  available_books: number;
}

export const libraryApi = {
  getBooks: (params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }) => api.get<ApiResponse<Book[]>>("/library/books", { params }),

  searchBooks: (query: string) =>
    api.get<ApiResponse<Book[]>>("/library/books/search", {
      params: { q: query },
    }),

  getBookById: (bookId: number) =>
    api.get<ApiResponse<Book>>(`/library/books/${bookId}`),

  addBook: (data: Omit<Book, "book_id" | "available_copies">) =>
    api.post<ApiResponse<Book>>("/library/books", data),

  updateBook: (bookId: number, updates: Partial<Book>) =>
    api.put<ApiResponse<Book>>(`/library/books/${bookId}`, updates),

  deleteBook: (bookId: number) =>
    api.delete<ApiResponse<{ message: string }>>(`/library/books/${bookId}`),

  issueBook: (bookId: number, userId: number) =>
    api.post<ApiResponse<BookIssue>>("/library/issue", {
      bookId,
      userId,
    }),

  returnBook: (issueId: number) =>
    api.post<ApiResponse<{ message: string }>>(`/library/return/${issueId}`),

  renewBook: (issueId: number) =>
    api.post<ApiResponse<{ message: string }>>(`/library/renew/${issueId}`),

  getUserBooks: (userId: number) =>
    api.get<ApiResponse<BookIssue[]>>(`/library/user/${userId}/books`),

  getAllActiveIssues: (status?: string) =>
    api.get<ApiResponse<BookIssue[]>>("/library/issues", {
      params: status ? { status } : undefined,
    }),

  getOverdueBooks: () => api.get<ApiResponse<BookIssue[]>>("/library/overdue"),

  getStatistics: () =>
    api.get<ApiResponse<LibraryStatistics>>("/library/statistics"),
};
