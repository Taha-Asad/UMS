import { useEffect, useState } from "react";
import { Box, Chip } from "@mui/material";
import { courseOfferingApi, enrollmentApi } from "../../api";
import type { CourseOffering, Enrollment } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Card } from "../../components/common";
import { useAuthStore } from "../../store";

export const MyCourses = () => {
  const { user } = useAuthStore();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await courseOfferingApi.getByTeacher(user.user_id);
        setOfferings(res.data.data || []);
      } catch (error) {
        console.error("Failed to load courses:", error);
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

  return (
    <Box>
      <PageHeader
        title="My courses"
        description="Manage content, attendance and grading for your assigned courses."
      />

      {offerings.length === 0 ? (
        <EmptyState
          title="No course offerings"
          description="You don't have any course offerings assigned yet."
        />
      ) : (
        <Table
          data={offerings as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Code" },
            { key: "course_name", header: "Course" },
            { key: "semester_name", header: "Semester" },
            {
              key: "current_enrollment",
              header: "Enrolled",
              render: (row) => (
                <Chip
                  label={`${row.current_enrollment}/${row.max_students || "∞"}`}
                  size="small"
                  color={
                    row.max_students &&
                    row.current_enrollment >= row.max_students
                      ? "error"
                      : "success"
                  }
                />
              ),
            },
          ]}
        />
      )}
    </Box>
  );
};
