import { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { dashboardApi, markApi } from "../../api";
import type { TeacherDashboardData } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  StatCard,
  Card,
  Table,
  EmptyState,
  Spinner,
  Button,
} from "../../components/common";
import { useAuthStore } from "../../store";
import {
  People as PeopleIcon,
  Book as BookIcon,
  Description as FileIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";

export const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [ungradedCount, setUngradedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [dashboardRes, ungradedRes] = await Promise.all([
          dashboardApi.getTeacherDashboard(),
          markApi
            .getUngraded(user.user_id)
            .catch(() => ({ data: { data: [] } })),
        ]);

        setData(dashboardRes.data.data);
        setUngradedCount(ungradedRes.data.data?.length || 0);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

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
        description="We couldn't load your teacher dashboard data yet."
      />
    );
  }

  const { teacherInfo, currentCourses, pendingGrades } = data;

  return (
    <Box>
      <PageHeader
        title={teacherInfo?.full_name ?? "Teacher dashboard"}
        description={
          teacherInfo
            ? `Good to see you, ${teacherInfo.full_name}. Manage your courses and assessments here.`
            : "Overview of your assigned courses and students."
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Current courses"
            value={teacherInfo?.total_courses ?? 0}
            helper="Courses assigned this semester"
            icon={<BookIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Total students"
            value={teacherInfo?.total_students ?? 0}
            helper="Across all your courses"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Pending grade submissions"
            value={ungradedCount || pendingGrades || 0}
            helper="Assessments awaiting final marks"
            icon={<FileIcon />}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box></Box>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => navigate("/teacher/timetable")}
        >
          View Timetable
        </Button>
      </Box>

      <Card
        title="Current course offerings"
        description="Your active course sections with enrollment counts."
      >
        {currentCourses.length === 0 ? (
          <EmptyState
            title="No current offerings"
            description="Once course offerings are assigned to you, they will appear here."
          />
        ) : (
          <Table
            data={currentCourses as unknown as Record<string, unknown>[]}
            columns={[
              { key: "course_code", header: "Code" },
              { key: "course_name", header: "Course" },
              { key: "semester_name", header: "Semester" },
              {
                key: "enrolled_students",
                header: "Enrolled",
                render: (row) => {
                  const record = row as Record<string, unknown>;
                  const enrolled = record.enrolled_students ?? 0;
                  const max = record.max_students || "∞";
                  return `${enrolled}/${max}`;
                },
              },
            ]}
          />
        )}
      </Card>
    </Box>
  );
};
