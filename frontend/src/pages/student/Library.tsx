import { useEffect, useState } from "react";
import { Box, Chip, Button } from "@mui/material";
import { libraryApi } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Card } from "../../components/common";
import { useAuthStore } from "../../store";
import { Book } from "@mui/icons-material";
import { format } from "date-fns";
import toast from "react-hot-toast";
import type { BookIssue } from "../../types";
import { AxiosError } from "axios";

export const Library = () => {
  const { user } = useAuthStore();
  const [books, setBooks] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await libraryApi.getUserBooks(user.user_id);
        setBooks((res.data.data as unknown as BookIssue[]) || []);
      } catch (error) {
        console.error("Failed to load library books:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const handleRenew = async (issueId: number) => {
    try {
      await libraryApi.renewBook(issueId);
      toast.success("Book renewed successfully");
      if (user) {
        const res = await libraryApi.getUserBooks(user.user_id);
        setBooks((res.data.data as unknown as BookIssue[]) || []);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to renew book");
      } else {
        toast.error("Failed to renew book");
      }
      toast.error(error.response?.data?.message || "Failed to renew book");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  const activeBooks = books.filter(
    (b) => b.status === "issued" || b.status === "overdue"
  );
  const returnedBooks = books.filter((b) => b.status === "returned");

  const getStatusColor = (status: BookIssue["status"]) => {
    switch (status) {
      case "returned":
        return "success";
      case "overdue":
        return "error";
      case "issued":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <PageHeader
        title="Library"
        description="Issued books, due dates and library activity."
      />

      <Box sx={{ mb: 3 }}>
        <Card
          title="Currently Issued Books"
          description="Books you have borrowed from the library."
        >
          {activeBooks.length === 0 ? (
            <EmptyState
              title="No active issues"
              description="You don't have any books issued at the moment."
            />
          ) : (
            <Table
              data={activeBooks as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "book_title",
                  header: "Book",
                  render: (row) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Book fontSize="small" />
                      <Box>{row.book_title as string}</Box>
                    </Box>
                  ),
                },
                {
                  key: "issue_date",
                  header: "Issued",
                  render: (row) =>
                    format(new Date(row.issue_date as string), "MMM dd, yyyy"),
                },
                {
                  key: "due_date",
                  header: "Due Date",
                  render: (row) => {
                    const dueDate = new Date(row.due_date as string);
                    const isOverdue = dueDate < new Date();
                    return (
                      <Box
                        sx={{
                          color: isOverdue ? "error.main" : "text.primary",
                        }}
                      >
                        {format(dueDate as Date, "MMM dd, yyyy")}
                      </Box>
                    );
                  },
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <Chip
                      label={row.status as string}
                      size="small"
                      color={getStatusColor(row.status as BookIssue["status"])}
                    />
                  ),
                },
                {
                  key: "fine_amount",
                  header: "Fine",
                  render: (row) =>
                    row.fine_amount ? `PKR ${row.fine_amount}` : "None",
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) =>
                    row.status === "issued" ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleRenew(row.issue_id as number)}
                      >
                        Renew
                      </Button>
                    ) : null,
                },
              ]}
            />
          )}
        </Card>
      </Box>

      {returnedBooks.length > 0 && (
        <Card title="Returned Books" description="Your library history.">
          <Table
            data={returnedBooks as unknown as Record<string, unknown>[]}
            columns={[
              { key: "book_title", header: "Book" },
              {
                key: "issue_date",
                header: "Issued",
                render: (row) =>
                  format(new Date(row.issue_date as string), "MMM dd, yyyy"),
              },
              {
                key: "return_date",
                header: "Returned",
                render: (row) =>
                  row.return_date
                    ? format(
                        new Date(row.return_date as string),
                        "MMM dd, yyyy"
                      )
                    : "N/A",
              },
            ]}
          />
        </Card>
      )}
    </Box>
  );
};
