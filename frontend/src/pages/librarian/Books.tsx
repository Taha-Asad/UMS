import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Add, Search } from "@mui/icons-material";
import { libraryApi } from "../../api";
import type { Book } from "../../api/library.api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
  SearchInput,
} from "../../components/common";
import { BookForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const res = await libraryApi.getBooks();
      setBooks(res.data.data || []);
    } catch (error) {
      console.error("Failed to load books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      void loadBooks();
      return;
    }
    try {
      setLoading(true);
      const res = await libraryApi.searchBooks(searchQuery);
      setBooks(res.data.data || []);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
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

  const handleFormSubmit = async (
    data: Omit<Book, "book_id" | "available_copies">
  ) => {
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
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Operation failed");
      } else {
        toast.error("Operation failed");
      }
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
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to delete book");
      } else {
        toast.error("Failed to delete book");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Books catalog"
        description="Search and manage all library books."
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

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <SearchInput
            placeholder="Search by title, author, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                void handleSearch();
              }
            }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="Add books to the library catalog or try a different search."
        />
      ) : (
        <Table
          data={books as unknown as Record<string, unknown>[]}
          columns={[
            { key: "isbn", header: "ISBN" },
            { key: "title", header: "Title" },
            { key: "author", header: "Author" },
            {
              key: "available_copies",
              header: "Available",
              render: (row) => `${row.available_copies}/${row.total_copies}`,
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row as Book)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row as Book)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Edit Book" : "Add Book"}
        maxWidth="md"
      >
        <BookForm
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
