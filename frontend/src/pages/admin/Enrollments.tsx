import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Chip, TextField, MenuItem } from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";
import { enrollmentApi, courseOfferingApi, semesterApi, userApi } from "../../api";
import type { Enrollment, CourseOffering, Semester } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface EnrollmentWithDetails extends Enrollment {
  student_name?: string;
  roll_number?: string;
}

export const Enrollments = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);

  useEffect(() => {
    void loadSemesters();
    void loadStudents();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      void loadEnrollments();
      void loadOfferings();
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

  const loadStudents = async () => {
    try {
      const res = await userApi.getStudents();
      const studentsData = Array.isArray(res.data.data) ? res.data.data : [];
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to load students:", error);
    }
  };

  const loadOfferings = async () => {
    if (!selectedSemester) return;
    try {
      const res = await courseOfferingApi.getBySemester(selectedSemester);
      const offeringsData: CourseOffering[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setOfferings(offeringsData);
    } catch (error) {
      console.error("Failed to load offerings:", error);
    }
  };

  const loadEnrollments = async () => {
    if (!selectedSemester) return;
    try {
      setLoading(true);
      // Get all enrollments by loading all course offerings and their enrollments
      const res = await courseOfferingApi.getBySemester(selectedSemester);
      const offeringsData: CourseOffering[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      
      const allEnrollments: EnrollmentWithDetails[] = [];
      for (const offering of offeringsData) {
        try {
          const enrollRes = await enrollmentApi.getCourseEnrollments(offering.offering_id);
          const enrolls = Array.isArray(enrollRes.data.data) ? enrollRes.data.data : [];
          allEnrollments.push(...enrolls.map((e: Enrollment) => ({
            ...e,
            course_code: offering.course_code,
            course_name: offering.course_name,
            semester_name: offering.semester_name,
          })));
        } catch (err) {
          console.error(`Failed to load enrollments for offering ${offering.offering_id}:`, err);
        }
      }
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error("Failed to load enrollments:", error);
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCreateMode(true);
    setSelectedEnrollment(null);
    setSelectedStudent(null);
    setSelectedOffering(null);
    setModalOpen(true);
  };

  const handleEdit = (enrollment: EnrollmentWithDetails) => {
    setCreateMode(false);
    setSelectedEnrollment(enrollment);
    setModalOpen(true);
  };

  const handleDelete = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setDeleteDialogOpen(true);
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedOffering) {
      toast.error("Please select both student and course offering");
      return;
    }
    try {
      setFormLoading(true);
      await enrollmentApi.enrollStudent(selectedStudent, selectedOffering);
      toast.success("Student enrolled successfully");
      setModalOpen(false);
      void loadEnrollments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Enrollment failed";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateGrade = async (enrollmentId: number, marks: number) => {
    try {
      await enrollmentApi.updateGrade(enrollmentId, marks);
      toast.success("Grade updated successfully");
      void loadEnrollments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to update grade";
      toast.error(msg);
    }
  };

  const handleDrop = async () => {
    if (!selectedEnrollment) return;
    try {
      await enrollmentApi.dropCourse(selectedEnrollment.enrollment_id);
      toast.success("Course dropped successfully");
      setDeleteDialogOpen(false);
      setSelectedEnrollment(null);
      void loadEnrollments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to drop course";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Enrollments"
        description="Manage student course enrollments and grades."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Enroll Student
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
          description="Please select a semester to view enrollments."
        />
      ) : enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description="No student enrollments for the selected semester."
        />
      ) : (
        <Table
          data={enrollments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "student_name", header: "Student" },
            { key: "course_code", header: "Course Code" },
            { key: "course_name", header: "Course" },
            {
              key: "status",
              header: "Status",
              render: (row) => {
                const status = (row as EnrollmentWithDetails).status;
                const colorMap: Record<string, "success" | "warning" | "error" | "default"> = {
                  enrolled: "success",
                  completed: "success",
                  dropped: "error",
                  failed: "error",
                };
                return (
                  <Chip
                    label={status}
                    size="small"
                    color={colorMap[status] || "default"}
                  />
                );
              },
            },
            {
              key: "marks",
              header: "Marks",
              render: (row) => {
                const enrollment = row as EnrollmentWithDetails;
                return enrollment.marks !== null && enrollment.marks !== undefined
                  ? `${enrollment.marks}%`
                  : "N/A";
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const enrollment = row as EnrollmentWithDetails;
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Update Grade">
                      <IconButton
                        size="small"
                        onClick={() => {
                          const marks = prompt("Enter marks (0-100):");
                          if (marks && !isNaN(Number(marks))) {
                            void handleUpdateGrade(
                              enrollment.enrollment_id,
                              Number(marks)
                            );
                          }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Drop Course">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(enrollment)}
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

      {/* Create Enrollment Modal */}
      <Modal
        open={modalOpen && createMode}
        onClose={() => {
          setModalOpen(false);
          setSelectedStudent(null);
          setSelectedOffering(null);
        }}
        title="Enroll Student"
        maxWidth="sm"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            select
            label="Student"
            fullWidth
            value={selectedStudent || ""}
            onChange={(e) => setSelectedStudent(Number(e.target.value))}
          >
            {students.map((student) => (
              <MenuItem key={student.user_id} value={student.user_id}>
                {student.full_name} ({student.roll_number || student.email})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Course Offering"
            fullWidth
            value={selectedOffering || ""}
            onChange={(e) => setSelectedOffering(Number(e.target.value))}
          >
            {offerings.map((offering) => (
              <MenuItem key={offering.offering_id} value={offering.offering_id}>
                {offering.course_code} - {offering.course_name}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleEnroll}
              loading={formLoading}
            >
              Enroll
            </Button>
          </Box>
        </Box>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedEnrollment(null);
        }}
        onConfirm={handleDrop}
        title="Drop Course"
        message={`Are you sure you want to drop this enrollment? This action cannot be undone.`}
        confirmText="Drop"
        variant="danger"
      />
    </Box>
  );
};

