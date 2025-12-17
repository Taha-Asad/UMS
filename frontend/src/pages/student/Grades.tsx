import { useEffect, useState } from "react";
import { Box, Chip } from "@mui/material";
import { markApi, enrollmentApi } from "../../api";
import type { Mark, Enrollment } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Card } from "../../components/common";
import { useAuthStore } from "../../store";

export const Grades = () => {
  const { user } = useAuthStore();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [marksRes, enrollmentsRes] = await Promise.all([
          markApi.getMarksByStudent(user.user_id),
          enrollmentApi.getStudentEnrollments(user.user_id),
        ]);

        setMarks(marksRes.data.data || []);
        setEnrollments(enrollmentsRes.data.data || []);
      } catch (error) {
        console.error("Failed to load grades:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "info";
    if (percentage >= 60) return "warning";
    return "error";
  };

  return (
    <Box>
      <PageHeader
        title="Grades & transcripts"
        description="View your course-wise grades and overall academic performance."
      />

      <Box sx={{ mb: 3 }}>
        <Card
          title="Assessment Grades"
          description="Marks obtained in various assessments."
        >
          {marks.length === 0 ? (
            <EmptyState
              title="No grades available"
              description="Your grades will appear here once assessments are graded."
            />
          ) : (
            <Table
              data={marks}
              columns={[
                { key: "assessment_title", header: "Assessment" },
                { key: "total_marks", header: "Total" },
                {
                  key: "marks_obtained",
                  header: "Obtained",
                  render: (row) => {
                    const percentage =
                      (row.marks_obtained / row.total_marks) * 100;
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box>{row.marks_obtained}</Box>
                        <Chip
                          label={`${percentage.toFixed(1)}%`}
                          size="small"
                          color={getGradeColor(percentage)}
                        />
                      </Box>
                    );
                  },
                },
                {
                  key: "graded_at",
                  header: "Graded",
                  render: (row) =>
                    row.graded_at
                      ? new Date(row.graded_at).toLocaleDateString()
                      : "Pending",
                },
              ]}
            />
          )}
        </Card>
      </Box>

      <Card
        title="Course Enrollments"
        description="Final grades for completed courses."
      >
        {enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments"
            description="You need to be enrolled in courses to see grades."
          />
        ) : (
          <Table
            data={enrollments.filter(
              (e) => e.status === "completed" || e.final_grade
            )}
            columns={[
              { key: "course_code", header: "Code" },
              { key: "course_name", header: "Course" },
              {
                key: "final_grade",
                header: "Grade",
                render: (row) =>
                  row.final_grade ? (
                    <Chip
                      label={row.final_grade}
                      size="small"
                      color="primary"
                    />
                  ) : (
                    "N/A"
                  ),
              },
              {
                key: "marks",
                header: "Marks",
                render: (row) => row.marks ?? "N/A",
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Chip
                    label={row.status}
                    size="small"
                    color={row.status === "completed" ? "success" : "default"}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>
    </Box>
  );
};
