import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { attendanceApi, courseOfferingApi, enrollmentApi } from "../../api";
import type { CourseOffering, Enrollment, AttendanceData } from "../../api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Button as CommonButton,
} from "../../components/common";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";

export const Attendance = () => {
  const { user } = useAuthStore();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] =
    useState<CourseOffering | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState<
    Record<number, "present" | "absent" | "late" | "excused">
  >({});
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      void loadOfferings();
    }
  }, [user]);

  const loadOfferings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await courseOfferingApi.getByTeacher(user.user_id);
      setOfferings(res.data.data || []);
    } catch (error) {
      console.error("Failed to load course offerings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (offering: CourseOffering) => {
    setSelectedOffering(offering);
    try {
      const res = await enrollmentApi.getCourseEnrollments(
        offering.offering_id
      );
      setEnrollments(res.data.data || []);
      setAttendanceData({});
      setMarkDialogOpen(true);
    } catch (error) {
      toast.error("Failed to load enrollments");
    }
  };

  const handleSubmitAttendance = async () => {
    if (!selectedOffering || !attendanceDate) return;
    try {
      const data: AttendanceData[] = enrollments
        .filter((enrollment) => enrollment.student_id)
        .map((enrollment) => ({
          studentId: enrollment.student_id!,
          status: attendanceData[enrollment.enrollment_id] || "absent",
        }));
      
      if (data.length === 0) {
        toast.error("No valid student enrollments found");
        return;
      }

      await attendanceApi.markAttendance(
        selectedOffering.offering_id,
        attendanceDate,
        data
      );
      toast.success("Attendance marked successfully");
      setMarkDialogOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.message || "Failed to mark attendance"
          : "Failed to mark attendance";
      toast.error(errorMessage);
      console.error("Attendance marking error:", error);
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
        title="Attendance management"
        description="Mark and review attendance for your course sections."
      />

      {offerings.length === 0 ? (
        <EmptyState
          title="No course offerings"
          description="You need course offerings to mark attendance."
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
              render: (row) =>
                `${row.current_enrollment}/${row.max_students || "∞"}`,
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <CommonButton
                  size="small"
                  variant="contained"
                  onClick={() => handleMarkAttendance(row as CourseOffering)}
                >
                  Mark Attendance
                </CommonButton>
              ),
            },
          ]}
        />
      )}

      <Dialog
        open={markDialogOpen}
        onClose={() => setMarkDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mark Attendance - {selectedOffering?.course_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {enrollments.map((enrollment) => (
                <Box
                  key={enrollment.enrollment_id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Box sx={{ fontWeight: 600 }}>
                      {enrollment.student_name}
                    </Box>
                    <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      {enrollment.roll_number}
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {(["present", "absent", "late", "excused"] as const).map(
                      (status) => (
                        <Chip
                          key={status}
                          label={status}
                          size="small"
                          clickable
                          color={
                            attendanceData[enrollment.enrollment_id] === status
                              ? status === "present"
                                ? "success"
                                : status === "absent"
                                ? "error"
                                : "warning"
                              : "default"
                          }
                          onClick={() =>
                            setAttendanceData((prev) => ({
                              ...prev,
                              [enrollment.enrollment_id]: status,
                            }))
                          }
                        />
                      )
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <CommonButton
            variant="outlined"
            onClick={() => setMarkDialogOpen(false)}
          >
            Cancel
          </CommonButton>
          <CommonButton variant="contained" onClick={handleSubmitAttendance}>
            Submit Attendance
          </CommonButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
