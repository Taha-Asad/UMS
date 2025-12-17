import { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { dashboardApi } from "../../api";
import type { AdminDashboardData } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  StatCard,
  Card,
  Table,
  EmptyState,
  Spinner,
} from "../../components/common";
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Book as BookIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { formatCurrency } from "../../utils/formatters";

export const Dashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getAdminDashboard();
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
        description="We couldn't load the admin dashboard data yet."
      />
    );
  }

  const { stats, revenueStats, recentActivities } = data;

  return (
    <Box>
      <PageHeader
        title="Administrator dashboard"
        description="At-a-glance view of students, teachers, departments and financials."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total students"
            value={stats.total_students}
            helper="All active students in the system"
            icon={<SchoolIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total teachers"
            value={stats.total_teachers}
            helper="Faculty members across departments"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total courses"
            value={stats.total_courses}
            helper="Offered in current and past semesters"
            icon={<BookIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Departments"
            value={stats.total_departments}
            helper="Academic departments configured in UMS"
            icon={<BusinessIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            title="Fee overview"
            description="Aggregated fee statistics from the finance module."
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Total fees generated
                </Box>
                <Box sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                  {formatCurrency(revenueStats.total_fees_generated)}
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Total fees collected
                </Box>
                <Box
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "success.main",
                  }}
                >
                  {formatCurrency(revenueStats.total_fees_collected)}{" "}
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Outstanding amount
                </Box>
                <Box
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: "warning.main",
                  }}
                >
                  {formatCurrency(revenueStats.outstanding_amount)}
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            title="Recent system activity"
            description="Last few operations captured by the audit log."
          >
            {recentActivities.length === 0 ? (
              <EmptyState
                title="No recent activity"
                description="Changes to core tables will show up here for quick monitoring."
              />
            ) : (
              <Table
                data={
                  recentActivities.slice(0, 5) as unknown as Record<
                    string,
                    unknown
                  >[]
                }
                columns={[
                  { key: "table_name", header: "Table" },
                  {
                    key: "operation",
                    header: "Operation",
                    render: (row: Record<string, unknown>) => {
                      const operation = row.operation as string;
                      return (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor:
                              operation === "INSERT"
                                ? "success.dark"
                                : operation === "UPDATE"
                                ? "info.dark"
                                : "error.dark",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {operation}
                        </Box>
                      );
                    },
                  },
                  {
                    key: "timestamp",
                    header: "When",
                    render: (row: Record<string, unknown>) =>
                      format(
                        new Date(row.timestamp as string),
                        "MMM dd, HH:mm"
                      ),
                  },
                ]}
              />
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            title="Shortcuts"
            description="Jump quickly to key management sections."
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                "Manage users & roles",
                "Departments & programs",
                "Fee structures & challans",
                "Reports & exports",
              ].map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    fontSize: "0.875rem",
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
