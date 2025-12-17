import { useEffect, useState } from "react";
import { Box, Chip } from "@mui/material";
import { enrollmentApi } from "../../api";
import type { Enrollment } from "../../types";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner } from "../../components/common";
import { useAuthStore } from "../../store";

export const MyCourses = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await enrollmentApi.getStudentEnrollments(user.user_id);
        setEnrollments((res.data.data as unknown as Enrollment[]) || []);
      } catch (error) {
        console.error("Failed to load enrollments:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  return (
    <Box>
      <PageHeader
        title="My courses"
        description="List of courses you are enrolled in."
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments"
          description="You are not enrolled in any courses yet. Visit the Enrollment page to enroll in courses."
        />
      ) : (
        <Table
          data={enrollments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Code" },
            { key: "course_name", header: "Course" },
            { key: "semester_name", header: "Semester" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Chip
                  label={row.status as string}
                  size="small"
                  color={
                    row.status === "enrolled"
                      ? "success"
                      : row.status === "completed"
                      ? "primary"
                      : "default"
                  }
                />
              ),
            },
            {
              key: "final_grade",
              header: "Grade",
              render: (row) =>
                row.final_grade ? (
                  <Chip
                    label={row.final_grade as string}
                    size="small"
                    color="primary"
                  />
                ) : (
                  "N/A"
                ),
            },
          ]}
        />
      )}
    </Box>
  );
};
