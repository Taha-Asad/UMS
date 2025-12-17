import { useEffect, useState } from "react";
import { Box, Chip, Button } from "@mui/material";
import { semesterApi } from "../../api";
import type { Semester } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Card } from "../../components/common";
import { CheckCircle } from "@mui/icons-material";
import toast from "react-hot-toast";
import { format } from "date-fns";

export const Semesters = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await semesterApi.getAll();
        setSemesters(res.data.data || []);
      } catch (error) {
        console.error("Failed to load semesters:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSetCurrent = async (semesterId: number) => {
    try {
      await semesterApi.setCurrent(semesterId);
      toast.success("Current semester updated");
      const res = await semesterApi.getAll();
      setSemesters(res.data.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update current semester"
      );
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
        title="Semesters"
        description="Configure academic semesters, durations and statuses."
      />

      {semesters.length === 0 ? (
        <EmptyState
          title="No semesters configured"
          description="Create semesters to manage academic terms."
        />
      ) : (
        <Table
          data={semesters}
          columns={[
            { key: "semester_name", header: "Semester" },
            { key: "academic_year", header: "Academic Year" },
            {
              key: "start_date",
              header: "Start Date",
              render: (row) => format(new Date(row.start_date), "MMM dd, yyyy"),
            },
            {
              key: "end_date",
              header: "End Date",
              render: (row) => format(new Date(row.end_date), "MMM dd, yyyy"),
            },
            {
              key: "is_current",
              header: "Current",
              render: (row) =>
                row.is_current ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Current"
                    size="small"
                    color="success"
                  />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSetCurrent(row.semester_id)}
                  >
                    Set Current
                  </Button>
                ),
            },
            {
              key: "registration_open",
              header: "Registration",
              render: (row) => (
                <Chip
                  label={row.registration_open ? "Open" : "Closed"}
                  size="small"
                  color={row.registration_open ? "success" : "default"}
                />
              ),
            },
          ]}
        />
      )}
    </Box>
  );
};
