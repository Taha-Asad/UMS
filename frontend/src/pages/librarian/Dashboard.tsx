import { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { libraryApi } from "../../api";
import type { LibraryStatistics } from "../../api/library.api";
import { PageHeader } from "../../components/layout";
import { StatCard, Card, EmptyState, Spinner } from "../../components/common";
import {
  Book as BookIcon,
  People as PeopleIcon,
  Schedule as ClockIcon,
} from "@mui/icons-material";

export const Dashboard = () => {
  const [stats, setStats] = useState<LibraryStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await libraryApi.getStatistics();
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to load library statistics:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

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
        title="Library dashboard"
        description="High level overview of books, issues and returns."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Total books"
            value={stats?.total_books ?? 0}
            helper="Total titles configured in the catalog"
            icon={<BookIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Active issues"
            value={stats?.active_issues ?? 0}
            helper="Books currently issued to students and staff"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Overdue returns"
            value={stats?.overdue_books ?? 0}
            helper="Books past their due date"
            icon={<ClockIcon />}
          />
        </Grid>
      </Grid>

      <Card
        title="Library overview"
        description="Current library statistics and activity."
      >
        {stats ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Available books
                </Box>
                <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {stats.available_books}
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Total issues
                </Box>
                <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  {stats.total_issues}
                </Box>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <EmptyState
            title="No statistics available"
            description="Library statistics will appear here once data is available."
          />
        )}
      </Card>
    </Box>
  );
};
