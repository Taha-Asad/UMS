import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Add, Person } from "@mui/icons-material";
import { courseOfferingApi, semesterApi } from "../../api";
import type { CourseOffering, Semester } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { CourseOfferingForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface CourseOfferingWithDetails {
  offering_id: number;
  course_id: number;
  semester_id: number;
  teacher_id?: number;
  max_students?: number;
  enrolled_students?: number;
  current_enrollment?: number;
  room_number?: string;
  course_code?: string;
  course_name?: string;
  teacher_name?: string;
  semester_name?: string;
  is_active?: boolean;
}

export const CourseOfferings = () => {
  const [offerings, setOfferings] = useState<CourseOfferingWithDetails[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] =
    useState<CourseOfferingWithDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      void loadOfferings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);

  const loadSemesters = async () => {
    try {
      const res = await semesterApi.getAll();
      const semestersData: Semester[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setSemesters(semestersData);
      // Set current semester as default
      const currentSemester = semestersData.find((s: Semester) => s.is_current);
      if (currentSemester) {
        setSelectedSemester(currentSemester.semester_id);
      } else if (semestersData.length > 0) {
        setSelectedSemester(semestersData[0].semester_id);
      }
    } catch (error) {
      console.error("Failed to load semesters:", error);
      toast.error("Failed to load semesters");
    }
  };

  const loadOfferings = async () => {
    if (!selectedSemester) return;
    try {
      setLoading(true);
      const res = await courseOfferingApi.getBySemester(selectedSemester);
      const offeringsData: CourseOfferingWithDetails[] = Array.isArray(
        res.data.data
      )
        ? res.data.data
        : [];
      setOfferings(offeringsData);
    } catch (error) {
      console.error("Failed to load course offerings:", error);
      toast.error("Failed to load course offerings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOffering(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (offering: CourseOfferingWithDetails) => {
    setSelectedOffering(offering);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    course_id: number;
    semester_id: number;
    teacher_id?: number;
    room_number?: string;
    max_students?: number;
  }) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedOffering) {
        await courseOfferingApi.update(selectedOffering.offering_id, data);
        toast.success("Course offering updated successfully");
      } else {
        await courseOfferingApi.create(data);
        toast.success("Course offering created successfully");
      }
      setModalOpen(false);
      void loadOfferings();
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

  const handleDelete = (offering: CourseOfferingWithDetails) => {
    setSelectedOffering(offering);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOffering) return;
    try {
      // Deactivate the offering instead of deleting
      await courseOfferingApi.update(selectedOffering.offering_id, {
        // The update method will handle filtering out invalid fields
      } as Partial<CourseOffering>);
      toast.success("Course offering deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedOffering(null);
      void loadOfferings();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete offering";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Course Offerings"
        description="Manage course offerings and assign teachers to courses."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Offering
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
          description="Please select a semester to view course offerings."
        />
      ) : offerings.length === 0 ? (
        <EmptyState
          title="No course offerings found"
          description="Create course offerings for the selected semester to manage them here."
        />
      ) : (
        <Table
          data={offerings as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Course Code" },
            { key: "course_name", header: "Course Name" },
            {
              key: "teacher_name",
              header: "Teacher",
              render: (row) => {
                const offering = row as unknown as CourseOfferingWithDetails;
                return offering.teacher_name ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person fontSize="small" />
                    {offering.teacher_name}
                  </Box>
                ) : (
                  <Chip label="Unassigned" size="small" color="warning" />
                );
              },
            },
            {
              key: "current_enrollment",
              header: "Enrollment",
              render: (row) => {
                const offering = row as unknown as CourseOfferingWithDetails;
                return `${offering.current_enrollment || 0} / ${
                  offering.max_students || 0
                }`;
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleEdit(row as unknown as CourseOfferingWithDetails)
                      }
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        handleDelete(
                          row as unknown as CourseOfferingWithDetails
                        )
                      }
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedOffering(null);
        }}
        title={isEdit ? "Edit Course Offering" : "Create Course Offering"}
        maxWidth="md"
      >
        <CourseOfferingForm
          key={selectedOffering?.offering_id || "new"} // Force re-render when offering changes
          initialData={selectedOffering || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedOffering(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Course Offering"
        message={`Are you sure you want to delete this course offering? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
