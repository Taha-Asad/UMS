import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { courseApi } from "../../api";
import type { Course, CreateCourseData, UpdateCourseData } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { CourseForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await courseApi.getAll();
      setCourses(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateCourseData | UpdateCourseData
  ) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedCourse) {
        await courseApi.update(
          selectedCourse.course_id,
          data as UpdateCourseData
        );
        toast.success("Course updated successfully");
      } else {
        await courseApi.create(data as CreateCourseData);
        toast.success("Course created successfully");
      }
      setModalOpen(false);
      void loadCourses();
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
    if (!selectedCourse) return;
    try {
      await courseApi.delete(selectedCourse.course_id);
      toast.success("Course deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      void loadCourses();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to delete course");
      } else {
        toast.error("Failed to delete course");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Courses"
        description="All courses defined in the university catalog."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Course
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Set up courses via the backend to manage them here."
        />
      ) : (
        <Table
          data={courses as unknown as Record<string, unknown>[]}
          columns={[
            { key: "course_code", header: "Code" },
            { key: "course_name", header: "Course" },
            { key: "credits", header: "Credits" },
            { key: "department_name", header: "Department" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row as Course)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row as Course)}
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
          setSelectedCourse(null);
        }}
        title={isEdit ? "Edit Course" : "Create Course"}
        maxWidth="md"
      >
        <CourseForm
          key={selectedCourse?.course_id || "new"}
          initialData={selectedCourse || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete course "${selectedCourse?.course_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
