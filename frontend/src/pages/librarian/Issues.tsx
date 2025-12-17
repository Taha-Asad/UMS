import { useEffect, useState } from "react";
import { Box, Button, TextField, Chip, MenuItem } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { libraryApi, userApi } from "../../api";
import type { BookIssue, Book } from "../../api/library.api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  Button as CommonButton,
} from "../../components/common";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AxiosError } from "axios";

export const Issues = () => {
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | "">("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, issuesRes, studentsRes, teachersRes] = await Promise.all([
        libraryApi.getBooks(),
        libraryApi.getAllActiveIssues().catch(() => ({ data: { data: [] } })),
        userApi.getStudents().catch(() => ({ data: { data: [] } })),
        userApi.getTeachers().catch(() => ({ data: { data: [] } })),
      ]);
      setBooks(Array.isArray(booksRes.data.data) ? booksRes.data.data : []);
      setIssues(Array.isArray(issuesRes.data.data) ? issuesRes.data.data : []);
      
      // Combine students and teachers (and potentially staff) who can borrow books
      const students = Array.isArray(studentsRes.data.data) ? studentsRes.data.data : [];
      const teachers = Array.isArray(teachersRes.data.data) ? teachersRes.data.data : [];
      const allUsers = [...students, ...teachers];
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async () => {
    if (!selectedBookId || !selectedUserId) {
      toast.error("Please select both book and user");
      return;
    }
    try {
      setIssuing(true);
      await libraryApi.issueBook(
        Number(selectedBookId),
        Number(selectedUserId)
      );
      toast.success("Book issued successfully");
      setIssueModalOpen(false);
      setSelectedBookId("");
      setSelectedUserId("");
      void loadData();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to issue book");
      } else {
        toast.error("Failed to issue book");
      }
    } finally {
      setIssuing(false);
    }
  };

  const handleReturn = async (issueId: number) => {
    try {
      await libraryApi.returnBook(issueId);
      toast.success("Book returned successfully");
      void loadData();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to return book");
      } else {
        toast.error("Failed to return book");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Issues"
        description="Manage book issues to students and staff."
        actions={
          <CommonButton
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={() => setIssueModalOpen(true)}
          >
            Issue Book
          </CommonButton>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No active issues"
          description="No books are currently issued."
        />
      ) : (
        <Table
          data={issues as unknown as Record<string, unknown>[]}
          columns={[
            { key: "book_title", header: "Book" },
            { key: "user_name", header: "User" },
            {
              key: "issue_date",
              header: "Issued",
              render: (row) =>
                format(new Date(row.issue_date as string), "MMM dd, yyyy"),
            },
            {
              key: "due_date",
              header: "Due Date",
              render: (row) =>
                format(new Date(row.due_date as string), "MMM dd, yyyy"),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Chip
                  label={row.status}
                  size="small"
                  color={
                    row.status === "issued"
                      ? "success"
                      : row.status === "overdue"
                      ? "error"
                      : "default"
                  }
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                row.status === "issued" || row.status === "overdue" ? (
                  <CommonButton
                    size="small"
                    variant="outlined"
                    onClick={() => handleReturn(row.issue_id as number)}
                  >
                    Return
                  </CommonButton>
                ) : null,
            },
          ]}
        />
      )}

      <Modal
        open={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setSelectedBookId("");
          setSelectedUserId("");
        }}
        title="Issue Book"
        maxWidth="sm"
        actions={
          <>
            <CommonButton
              variant="outlined"
              onClick={() => setIssueModalOpen(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton 
              variant="contained" 
              onClick={handleIssueBook}
              loading={issuing}
            >
              Issue Book
            </CommonButton>
          </>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Book"
            fullWidth
            SelectProps={{ native: true }}
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(Number(e.target.value) || "")}
          >
            <option value="">Select a book</option>
            {books.map((book) => (
              <option key={book.book_id} value={book.book_id}>
                {book.title} by {book.author}
                {book.available_copies === 0 && " (Not available)"}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="User"
            fullWidth
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(Number(e.target.value) || "")}
            helperText="Select the user to issue the book to"
          >
            <MenuItem value="">Select a user</MenuItem>
            {users.map((user) => (
              <MenuItem key={user.user_id} value={user.user_id}>
                {user.full_name} ({user.roll_number || user.employee_id || user.email}) - {user.role}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Modal>
    </Box>
  );
};
