import { useEffect, useState } from "react";
import { Box, Button, Chip } from "@mui/material";
import { enrollmentApi, courseOfferingApi, semesterApi } from "../../api";
import type { Enrollment, CourseOffering, Semester } from "../../api";
import { PageHeader } from "../../components/layout";
import { Table, EmptyState, Spinner, Card } from "../../components/common";
import { useAuthStore } from "../../store";
import { Add as AddIcon } from "@mui/icons-material";
import toast from "react-hot-toast";

export const Enrollment = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOffering[]>(
    []
  );
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [semesterRes, enrollmentsRes] = await Promise.all([
          semesterApi.getCurrent(),
          enrollmentApi.getStudentEnrollments(user.user_id),
        ]);

        setCurrentSemester(semesterRes.data.data);
        setEnrollments(enrollmentsRes.data.data || []);

        if (semesterRes.data.data) {
          const availableRes = await courseOfferingApi.getAvailableForStudent(
            user.user_id,
            semesterRes.data.data.semester_id
          );
          setAvailableCourses(availableRes.data.data || []);
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load enrollment data"
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const handleEnroll = async (offeringId: number) => {
    if (!user) return;
    setEnrolling(true);
    try {
      await enrollmentApi.enrollStudent(user.user_id, offeringId);
      toast.success("Enrolled successfully");
      const res = await enrollmentApi.getStudentEnrollments(user.user_id);
      setEnrollments(res.data.data || []);
      if (currentSemester) {
        const availableRes = await courseOfferingApi.getAvailableForStudent(
          user.user_id,
          currentSemester.semester_id
        );
        setAvailableCourses(availableRes.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDrop = async (enrollmentId: number) => {
    if (!confirm("Are you sure you want to drop this course?")) return;
    try {
      await enrollmentApi.dropCourse(enrollmentId);
      toast.success("Course dropped successfully");
      if (user) {
        const res = await enrollmentApi.getStudentEnrollments(user.user_id);
        setEnrollments(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to drop course");
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
        title="Enrollment"
        description={
          currentSemester
            ? `Add or drop courses for ${currentSemester.semester_name} ${currentSemester.academic_year}`
            : "Add or drop courses based on offerings for this semester."
        }
      />

      <Box sx={{ mb: 3 }}>
        <Card
          title="My Enrollments"
          description="Courses you are currently enrolled in."
        >
          {enrollments.length === 0 ? (
            <EmptyState
              title="No enrollments"
              description="You are not enrolled in any courses yet."
            />
          ) : (
            <Table
              data={enrollments}
              columns={[
                { key: "course_code", header: "Code" },
                { key: "course_name", header: "Course" },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <Chip
                      label={row.status}
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
                  key: "actions",
                  header: "Actions",
                  render: (row) =>
                    row.status === "enrolled" ? (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDrop(row.enrollment_id)}
                      >
                        Drop
                      </Button>
                    ) : null,
                },
              ]}
            />
          )}
        </Card>
      </Box>

      {currentSemester && (
        <Card
          title="Available Courses"
          description="Courses available for enrollment this semester."
        >
          {availableCourses.length === 0 ? (
            <EmptyState
              title="No available courses"
              description="There are no courses available for enrollment at this time."
            />
          ) : (
            <Table
              data={availableCourses}
              columns={[
                { key: "course_code", header: "Code" },
                { key: "course_name", header: "Course" },
                {
                  key: "current_enrollment",
                  header: "Enrolled",
                  render: (row) =>
                    `${row.current_enrollment}/${row.max_students || "∞"}`,
                },
                {
                  key: "actions",
                  header: "Actions",
                  render: (row) => (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleEnroll(row.offering_id)}
                      disabled={
                        enrolling ||
                        (row.max_students &&
                          row.current_enrollment >= row.max_students)
                      }
                    >
                      Enroll
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </Card>
      )}
    </Box>
  );
};
