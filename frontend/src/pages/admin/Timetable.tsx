import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { timetableApi, courseOfferingApi, semesterApi } from "../../api";
import type { TimetableEntry, CourseOffering, Semester } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { TimetableForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface TimetableWithDetails extends TimetableEntry {
  course_code?: string;
  course_name?: string;
  teacher_name?: string;
}

export const Timetable = () => {
  const [schedules, setSchedules] = useState<TimetableWithDetails[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TimetableWithDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      void loadSchedules();
    }
  }, [selectedSemester]);

  const loadSemesters = async () => {
    try {
      const res = await semesterApi.getAll();
      const semestersData: Semester[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setSemesters(semestersData);
      const current = semestersData.find((s) => s.is_current);
      if (current) setSelectedSemester(current.semester_id);
      else if (semestersData.length > 0) setSelectedSemester(semestersData[0].semester_id);
    } catch (error) {
      console.error("Failed to load semesters:", error);
    }
  };

  const loadSchedules = async () => {
    if (!selectedSemester) return;
    try {
      setLoading(true);
      // Load all offerings for the semester and get their schedules
      const res = await courseOfferingApi.getBySemester(selectedSemester);
      const offeringsData: CourseOffering[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      
      const allSchedules: TimetableWithDetails[] = [];
      for (const offering of offeringsData) {
        try {
          const scheduleRes = await timetableApi.getByOffering(offering.offering_id);
          const schedules = Array.isArray(scheduleRes.data.data) ? scheduleRes.data.data : [];
          allSchedules.push(...schedules.map((s: TimetableEntry) => ({
            ...s,
            course_code: offering.course_code,
            course_name: offering.course_name,
            teacher_name: offering.teacher_name,
          })));
        } catch (err) {
          console.error(`Failed to load schedule for offering ${offering.offering_id}:`, err);
        }
      }
      setSchedules(allSchedules);
    } catch (error) {
      console.error("Failed to load schedules:", error);
      toast.error("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (schedule: TimetableWithDetails) => {
    setSelectedSchedule(schedule);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (schedule: TimetableWithDetails) => {
    setSelectedSchedule(schedule);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedSchedule) {
        await timetableApi.update(selectedSchedule.schedule_id, data);
        toast.success("Schedule updated successfully");
      } else {
        await timetableApi.create(data);
        toast.success("Schedule created successfully");
      }
      setModalOpen(false);
      void loadSchedules();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Operation failed";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return;
    try {
      await timetableApi.delete(selectedSchedule.schedule_id);
      toast.success("Schedule deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedSchedule(null);
      void loadSchedules();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete schedule";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Timetable Management"
        description="Manage course schedules and room assignments."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Schedule
          </Button>
        }
      />

      {/* Semester Filter */}
      {semesters.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {semesters.map((semester) => (
            <Chip
              key={semester.semester_id}
              label={`${semester.semester_name} ${semester.academic_year}`}
              onClick={() => setSelectedSemester(semester.semester_id)}
              color={
                selectedSemester === semester.semester_id
                  ? "primary"
                  : "default"
              }
              variant={
                selectedSemester === semester.semester_id
                  ? "filled"
                  : "outlined"
              }
            />
          ))}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : !selectedSemester ? (
        <EmptyState
          title="No semester selected"
          description="Please select a semester to view schedules."
        />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No schedules found"
          description="Create schedules for course offerings in the selected semester."
        />
      ) : (
        <Table
          data={schedules as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Course Code" },
            { key: "course_name", header: "Course" },
            { key: "day_of_week", header: "Day" },
            {
              key: "time",
              header: "Time",
              render: (row) => {
                const schedule = row as TimetableWithDetails;
                return `${schedule.start_time} - ${schedule.end_time}`;
              },
            },
            { key: "room_number", header: "Room" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const schedule = row as TimetableWithDetails;
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(schedule)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(schedule)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ]}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSchedule(null);
        }}
        title={isEdit ? "Edit Schedule" : "Create Schedule"}
        maxWidth="md"
      >
        <TimetableForm
          key={selectedSchedule?.schedule_id || "new"}
          initialData={selectedSchedule || undefined}
          semesterId={selectedSemester || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Schedule"
        message={`Are you sure you want to delete this schedule? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};

