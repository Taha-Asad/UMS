import { useEffect, useState } from "react";
import { Box, Grid, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { libraryApi } from "../../api";
import type { LibraryStatistics, BookIssue, Book } from "../../api/library.api";
import { PageHeader } from "../../components/layout";
import {
  StatCard,
  Card,
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { BookForm } from "../../components/forms";
import {
  Book as BookIcon,
  People,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Library = () => {
  const [stats, setStats] = useState<LibraryStatistics | null>(null);
  const [recentIssues, setRecentIssues] = useState<BookIssue[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadData();
    void loadBooks();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, overdueRes] = await Promise.all([
        libraryApi.getStatistics(),
        libraryApi.getOverdueBooks(),
      ]);
      setStats(statsRes.data.data);
      setRecentIssues((overdueRes.data.data || []).slice(0, 10));
    } catch (error) {
      console.error("Failed to load library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      setBooksLoading(true);
      const res = await libraryApi.getBooks();
      setBooks(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load books:", error);
      toast.error("Failed to load books");
    } finally {
      setBooksLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBook(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedBook) {
        await libraryApi.updateBook(selectedBook.book_id, data);
        toast.success("Book updated successfully");
      } else {
        await libraryApi.addBook(data);
        toast.success("Book added successfully");
      }
      setModalOpen(false);
      void loadBooks();
      void loadData();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Operation failed";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBook) return;
    try {
      await libraryApi.deleteBook(selectedBook.book_id);
      toast.success("Book deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedBook(null);
      void loadBooks();
      void loadData();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete book";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Library Management"
        description="Manage books, track issues and monitor library statistics."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Book
          </Button>
        }
      />

      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Total books"
              value={stats.total_books}
              icon={<BookIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Active issues"
              value={stats.active_issues}
              icon={<People />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Overdue books"
              value={stats.overdue_books}
              icon={<Warning />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Available"
              value={stats.available_books}
              icon={<CheckCircle />}
            />
          </Grid>
        </Grid>
      )}

      <Card
        title="Books"
        description="Manage library book catalog."
        sx={{ mb: 3 }}
      >
        {booksLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <Spinner />
          </Box>
        ) : books.length === 0 ? (
          <EmptyState
            title="No books found"
            description="Add books to the library catalog."
          />
        ) : (
          <Table
            data={books as unknown as Record<string, unknown>[]}
            columns={[
              { key: "title", header: "Title" },
              { key: "author", header: "Author" },
              { key: "isbn", header: "ISBN" },
              {
                key: "copies",
                header: "Copies",
                render: (row) => {
                  const book = row as Book;
                  return `${book.available_copies} / ${book.total_copies}`;
                },
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => {
                  const book = row as Book;
                  return (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(book)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(book)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                },
              },
            ]}
          />
        )}
      </Card>

      <Card
        title="Overdue Books"
        description="Books that are past their due date."
      >
        {recentIssues.length === 0 ? (
          <EmptyState
            title="No overdue books"
            description="All books have been returned on time."
          />
        ) : (
          <Table
            data={recentIssues as unknown as Record<string, unknown>[]}
            columns={[
              { key: "book_title", header: "Book" },
              { key: "user_name", header: "User" },
              {
                key: "due_date",
                header: "Due Date",
                render: (row) =>
                  new Date(row.due_date as string).toLocaleDateString(),
              },
              {
                key: "fine_amount",
                header: "Fine",
                render: (row) =>
                  row.fine_amount ? `PKR ${row.fine_amount}` : "None",
              },
            ]}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBook(null);
        }}
        title={isEdit ? "Edit Book" : "Add Book"}
        maxWidth="md"
      >
        <BookForm
          key={selectedBook?.book_id || "new"}
          initialData={selectedBook || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedBook(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${selectedBook?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
