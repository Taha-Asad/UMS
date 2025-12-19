import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { timetableApi } from "../../api";
import { PageHeader } from "../../components/layout";
import { EmptyState, Spinner, Card } from "../../components/common";
import { useAuthStore } from "../../store";
import type { TimetableEntry } from "../../api/timetable.api";

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const Timetable = () => {
  const { user } = useAuthStore();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await timetableApi.getTeacherTimetable(user.user_id);
        setTimetable(res.data.data || []);
      } catch (error) {
        console.error("Failed to load timetable:", error);
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

  const groupedByDay = timetable.reduce((acc, entry) => {
    if (!acc[entry.day_of_week]) {
      acc[entry.day_of_week] = [];
    }
    acc[entry.day_of_week].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  const sortedDays = daysOrder.filter((day) => groupedByDay[day]);

  return (
    <Box>
      <PageHeader
        title="Teaching timetable"
        description="Your weekly lecture schedule across all departments."
      />

      {timetable.length === 0 ? (
        <EmptyState
          title="No timetable available"
          description="Your teaching schedule will appear here once it's configured."
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {sortedDays.map((day) => {
            const entries = groupedByDay[day].sort((a, b) =>
              a.start_time.localeCompare(b.start_time)
            );
            return (
              <Card key={day} title={day}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {entries.map((entry) => (
                    <Box
                      key={entry.schedule_id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ fontWeight: 600, mb: 0.5 }}>
                          {entry.course_code} - {entry.course_name}
                        </Box>
                        <Box
                          sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                        >
                          Room: {entry.room_number}
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Box sx={{ fontWeight: 600 }}>
                          {entry.start_time} - {entry.end_time}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
