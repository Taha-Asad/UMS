import { useEffect, useState } from "react";
import { Grid, Box, Chip } from "@mui/material";
import { dashboardApi } from "../../api";
import type { StudentDashboardData } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  StatCard,
  Card,
  Table,
  EmptyState,
  Spinner,
} from "../../components/common";
import {
  Book as BookIcon,
  School as SchoolIcon,
  AccountBalanceWallet as WalletIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { formatCurrency, formatNumber } from "../../utils/formatters";

export const Dashboard = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getStudentDashboard();
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No dashboard data"
        description="We couldn't load your student dashboard data yet."
      />
    );
  }

  const { studentInfo, recentNotices, upcomingAssessments } = data;

  return (
    <Box>
      <PageHeader
        title={studentInfo?.full_name ?? "Student dashboard"}
        description={
          studentInfo
            ? `Welcome back, ${studentInfo.full_name}. Here is a quick overview of your academic status.`
            : "Overview of your enrolled courses, grades and fees."
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Current courses"
            value={studentInfo?.current_courses ?? 0}
            helper="Courses you are enrolled in this semester"
            icon={<BookIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Completed courses"
            value={studentInfo?.completed_courses ?? 0}
            helper="Successfully passed in previous semesters"
            icon={<SchoolIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Pending fees"
            value={formatCurrency(studentInfo?.pending_fees ?? 0)}
            helper="Outstanding amount for this academic year"
            icon={<WalletIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            title="Recent notices"
            description="Official announcements from your department and administration."
          >
            {recentNotices.length === 0 ? (
              <EmptyState
                title="No notices yet"
                description="New academic and examination notices will appear here."
              />
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentNotices.map((notice, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                        {notice.title}
                      </Box>
                      <Chip
                        label={notice.category}
                        size="small"
                        color={
                          notice.category === "urgent" ? "error" : "primary"
                        }
                      />
                    </Box>
                    <Box
                      sx={{
                        fontSize: "0.875rem",
                        color: "text.secondary",
                        mb: 1,
                      }}
                    >
                      {notice.content}
                    </Box>
                    <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                      {format(new Date(notice.created_at), "MMM dd, yyyy")}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            title="Upcoming assessments"
            description="Assignments, quizzes and exams scheduled for your courses."
          >
            {upcomingAssessments.length === 0 ? (
              <EmptyState
                title="No upcoming assessments"
                description="Once your teachers publish assessments, they will be listed here."
              />
            ) : (
              <Table
                data={
                  upcomingAssessments as unknown as Record<string, unknown>[]
                }
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    render: (row: Record<string, unknown>) => (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AssignmentIcon fontSize="small" />
                        <Box>{row.title as string}</Box>
                      </Box>
                    ),
                  },
                  { key: "course_code", header: "Course" },
                  {
                    key: "due_date",
                    header: "Due",
                    render: (row: Record<string, unknown>) => {
                      const dueDate = new Date(row.due_date as string);
                      const isOverdue = dueDate < new Date();
                      return (
                        <Box
                          sx={{
                            color: isOverdue ? "error.main" : "text.primary",
                          }}
                        >
                          {format(dueDate, "MMM dd, yyyy")}
                        </Box>
                      );
                    },
                  },
                ]}
              />
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            title="Profile snapshot"
            description="Your current academic profile overview."
          >
            {studentInfo ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      Roll number
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>
                      {studentInfo.roll_number || "N/A"}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      Department
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>
                      {studentInfo.department || "N/A"}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      Semester
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>
                      {studentInfo.semester || "N/A"}
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box>
                    <Box
                      sx={{
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      CGPA
                    </Box>
                    <Box sx={{ fontWeight: 600 }}>
                      {formatNumber(studentInfo.cgpa, 2)}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <EmptyState
                title="No student profile"
                description="Your detailed student profile is not available yet. Please contact administration."
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
