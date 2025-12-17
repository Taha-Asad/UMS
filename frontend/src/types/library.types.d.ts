export interface Book {
  book_id: number;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  published_year?: number;
  copies_total: number;
  copies_available: number;
  cover_url?: string;
  description?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  published_year?: number;
  copies_total: number;
  description?: string;
  location?: string;
  cover_url?: string;
  is_active?: boolean;
}

export type IssueStatus = "issued" | "returned" | "overdue";

export interface BookIssue {
  issue_id: number;
  book_id: number;
  student_id: number;
  issued_on: string;
  due_on: string;
  returned_on?: string;
  status: IssueStatus;
  fine_amount?: number;
}

export interface IssueBookInput {
  book_id: number;
  student_id: number;
  due_on: string;
}

export interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  overdueBooks: number;
  totalMembers: number;
}
