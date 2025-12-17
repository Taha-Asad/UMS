import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Add, Publish } from "@mui/icons-material";
import { assessmentApi, courseOfferingApi } from "../../api";
import type { Assessment } from "../../api/assessment.api";
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
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { format } from "date-fns";

export const Assessments = () => {
  const { user } = useAuthStore();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      void loadAssessments();
    }
  }, [user]);

  const loadAssessments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await assessmentApi.getByTeacher(user.user_id);
      setAssessments(res.data.data || []);
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

  const handleEdit = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setDeleteDialogOpen(true);
  };

  const handlePublish = async (assessment: Assessment) => {
    try {
      await assessmentApi.publish(assessment.assessment_id);
      toast.success("Assessment published successfully");
      void loadAssessments();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to publish");
      } else {
        toast.error("Failed to publish");
      }
    }
  };

  const handleFormSubmit = async (
    data: Omit<Assessment, "assessment_id" | "created_at" | "published">
  ) => {
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
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Operation failed");
      } else {
        toast.error("Operation failed");
      }
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
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Failed to delete assessment"
        );
      } else {
        toast.error("Failed to delete assessment");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Assessments"
        description="Assignments, quizzes, projects and exams for your courses."
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : assessments.length === 0 ? (
        <EmptyState
          title="No assessments"
          description="Create assessments for your courses to manage assignments and exams."
        />
      ) : (
        <Table
          data={assessments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "title", header: "Title" },
            {
              key: "type",
              header: "Type",
              render: (row) => (
                <Chip
                  label={(row.type as string).toUpperCase()}
                  size="small"
                  color="primary"
                />
              ),
            },
            {
              key: "total_marks",
              header: "Marks",
              render: (row) => `${row.total_marks}`,
            },
            {
              key: "due_date",
              header: "Due Date",
              render: (row) =>
                format(new Date(row.due_date as string), "MMM dd, yyyy HH:mm"),
            },
            {
              key: "published",
              header: "Status",
              render: (row) => (
                <Chip
                  label={row.published ? "Published" : "Draft"}
                  size="small"
                  color={row.published ? "success" : "default"}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!row.published && (
                    <Tooltip title="Publish">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handlePublish(row as Assessment)}
                      >
                        <Publish fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row as Assessment)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row as Assessment)}
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
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Edit Assessment" : "Create Assessment"}
        maxWidth="md"
      >
        <AssessmentForm
          initialData={selectedAssessment || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
          teacherId={user?.user_id}
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
        message={`Are you sure you want to delete assessment "${selectedAssessment?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
