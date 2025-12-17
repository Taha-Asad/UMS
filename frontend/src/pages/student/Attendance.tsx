import { useEffect, useState } from "react";
import { Box, Grid, LinearProgress } from "@mui/material";
import { attendanceApi, enrollmentApi } from "../../api";
import type { AttendanceStats, Enrollment } from "../../api";
import { PageHeader } from "../../components/layout";
import { Card, EmptyState, Spinner, Table } from "../../components/common";
import { useAuthStore } from "../../store";
import { CheckCircle, Cancel, Schedule, Warning } from "@mui/icons-material";

export const Attendance = () => {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceData, setAttendanceData] = useState<
    Record<number, AttendanceStats>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const enrollmentsRes = await enrollmentApi.getStudentEnrollments(
          user.user_id,
          "enrolled"
        );
        const enrollments = enrollmentsRes.data.data || [];
        setEnrollments(enrollments);

        const attendancePromises = enrollments.map(async (enrollment) => {
          try {
            const res = await attendanceApi.getStudentAttendance(
              user.user_id,
              enrollment.offering_id
            );
            return { offeringId: enrollment.offering_id, stats: res.data.data };
          } catch {
            return { offeringId: enrollment.offering_id, stats: null };
          }
        });

        const results = await Promise.all(attendancePromises);
        const attendanceMap: Record<number, AttendanceStats> = {};
        results.forEach(({ offeringId, stats }) => {
          if (stats) attendanceMap[offeringId] = stats;
        });
        setAttendanceData(attendanceMap);
      } catch (error) {
        console.error("Failed to load attendance:", error);
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

  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No enrollments"
        description="You need to be enrolled in courses to view attendance."
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Attendance"
        description="View your attendance summary across all enrolled courses."
      />

      <Grid container spacing={3}>
        {enrollments.map((enrollment) => {
          const stats = attendanceData[enrollment.offering_id];
          const percentage = stats?.attendance_percentage || 0;

          return (
            <Grid item xs={12} md={6} key={enrollment.enrollment_id}>
              <Card
                title={`${enrollment.course_code} - ${enrollment.course_name}`}
                description={`Attendance for ${
                  enrollment.semester_name || "current semester"
                }`}
              >
                {stats ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ fontWeight: 600 }}>Overall Attendance</Box>
                        <Box
                          sx={{
                            fontWeight: 600,
                            color:
                              percentage >= 75
                                ? "success.main"
                                : "warning.main",
                          }}
                        >
                          {percentage.toFixed(1)}%
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "action.hover",
                        }}
                        color={
                          percentage >= 75
                            ? "success"
                            : percentage >= 50
                            ? "warning"
                            : "error"
                        }
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center" }}>
                          <CheckCircle
                            sx={{ color: "success.main", mb: 0.5 }}
                          />
                          <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {stats.present}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            Present
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center" }}>
                          <Cancel sx={{ color: "error.main", mb: 0.5 }} />
                          <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {stats.absent}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            Absent
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center" }}>
                          <Schedule sx={{ color: "warning.main", mb: 0.5 }} />
                          <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {stats.late}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            Late
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: "center" }}>
                          <Warning sx={{ color: "info.main", mb: 0.5 }} />
                          <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {stats.excused}
                          </Box>
                          <Box
                            sx={{
                              fontSize: "0.75rem",
                              color: "text.secondary",
                            }}
                          >
                            Excused
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                      >
                        Total Classes: {stats.total_classes}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <EmptyState
                    title="No attendance data"
                    description="Attendance records will appear here once your teacher marks attendance."
                  />
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
