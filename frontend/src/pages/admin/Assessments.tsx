import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";
import { assessmentApi, courseOfferingApi, semesterApi } from "../../api";
import type { Assessment, CourseOffering, Semester } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { AssessmentForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface AssessmentWithDetails extends Assessment {
  semester_name?: string;
}

export const Assessments = () => {
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentWithDetails | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      void loadAssessments();
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

  const loadAssessments = async () => {
    if (!selectedSemester) return;
    try {
      setLoading(true);
      // Load all offerings for the semester and get their assessments
      const res = await courseOfferingApi.getBySemester(selectedSemester);
      const offeringsData: CourseOffering[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];
      
      const allAssessments: AssessmentWithDetails[] = [];
      for (const offering of offeringsData) {
        try {
          const assessmentRes = await assessmentApi.getByOffering(offering.offering_id, false);
          const assessments = Array.isArray(assessmentRes.data.data) ? assessmentRes.data.data : [];
          allAssessments.push(...assessments.map((a: Assessment) => ({
            ...a,
            semester_name: offering.semester_name,
          })));
        } catch (err) {
          console.error(`Failed to load assessments for offering ${offering.offering_id}:`, err);
        }
      }
      setAssessments(allAssessments);
    } catch (error) {
      console.error("Failed to load assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedAssessment(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (assessment: AssessmentWithDetails) => {
    setSelectedAssessment(assessment);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (assessment: AssessmentWithDetails) => {
    setSelectedAssessment(assessment);
    setDeleteDialogOpen(true);
  };

  const handlePublish = async (assessmentId: number) => {
    try {
      await assessmentApi.publish(assessmentId);
      toast.success("Assessment published successfully");
      void loadAssessments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to publish assessment";
      toast.error(msg);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedAssessment) {
        await assessmentApi.update(selectedAssessment.assessment_id, data);
        toast.success("Assessment updated successfully");
      } else {
        await assessmentApi.create(data);
        toast.success("Assessment created successfully");
      }
      setModalOpen(false);
      void loadAssessments();
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
    if (!selectedAssessment) return;
    try {
      await assessmentApi.delete(selectedAssessment.assessment_id);
      toast.success("Assessment deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedAssessment(null);
      void loadAssessments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete assessment";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Assessments"
        description="Manage assignments, quizzes, and exams for all courses."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Create Assessment
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
          description="Please select a semester to view assessments."
        />
      ) : assessments.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="Create assessments for course offerings in the selected semester."
        />
      ) : (
        <Table
          data={assessments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Course Code" },
            { key: "course_name", header: "Course" },
            { key: "title", header: "Title" },
            {
              key: "type",
              header: "Type",
              render: (row) => {
                const type = (row as AssessmentWithDetails).type;
                return (
                  <Chip
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                );
              },
            },
            {
              key: "due_date",
              header: "Due Date",
              render: (row) => {
                const date = new Date((row as AssessmentWithDetails).due_date);
                return date.toLocaleDateString();
              },
            },
            {
              key: "published",
              header: "Status",
              render: (row) => {
                const published = (row as AssessmentWithDetails).published;
                return (
                  <Chip
                    label={published ? "Published" : "Draft"}
                    size="small"
                    color={published ? "success" : "default"}
                  />
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const assessment = row as AssessmentWithDetails;
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {!assessment.published && (
                      <Tooltip title="Publish">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePublish(assessment.assessment_id)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(assessment)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(assessment)}
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
          setSelectedAssessment(null);
        }}
        title={isEdit ? "Edit Assessment" : "Create Assessment"}
        maxWidth="md"
      >
        <AssessmentForm
          key={selectedAssessment?.assessment_id || "new"}
          initialData={selectedAssessment || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
          teacherId={undefined}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedAssessment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Assessment"
        message={`Are you sure you want to delete this assessment? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};

