import { useEffect, useState } from "react";
import { Box, Chip } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { libraryApi } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Button } from "../../components/common";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AxiosError } from "axios";
import type { BookIssue } from "../../types";

export const Returns = () => {
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      // Get all active issues (issued and overdue) that can be returned
      const res = await libraryApi.getAllActiveIssues();
      setIssues(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("Failed to load returns:", error);
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (issueId: number) => {
    try {
      await libraryApi.returnBook(issueId);
      toast.success("Book returned successfully");
      void loadReturns();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to process return"
        );
      } else {
        toast.error("Failed to process return");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Returns"
        description="Track and confirm returned books."
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No pending returns"
          description="All books have been returned."
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
              render: (row) => {
                const dueDate = new Date(row.due_date as string);
                const isOverdue = dueDate < new Date();
                return (
                  <Box
                    sx={{ color: isOverdue ? "error.main" : "text.primary" }}
                  >
                    {format(dueDate, "MMM dd, yyyy")}
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
                  color={
                    row.status === "returned"
                      ? "success"
                      : row.status === "overdue"
                      ? "error"
                      : "warning"
                  }
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
                row.status !== "returned" ? (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => handleReturn(row.issue_id as number)}
                  >
                    Confirm Return
                  </Button>
                ) : (
                  <Chip label="Returned" size="small" color="success" />
                ),
            },
          ]}
        />
      )}
    </Box>
  );
};
