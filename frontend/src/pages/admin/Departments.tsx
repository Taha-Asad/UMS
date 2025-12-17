import { useEffect, useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { departmentApi } from "../../api";
import type {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { DepartmentForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface DepartmentWithStats extends Department {
  department_code: string;
  department_name: string;
  total_students: number;
  total_teachers: number;
}

export const Departments = () => {
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentWithStats | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentApi.getAll();
      // Backend returns ApiResponse<Department[]>, not PaginatedResponse
      const deptList: Department[] = Array.isArray(res.data.data)
        ? res.data.data
        : [];

      const departmentsWithStats = await Promise.all(
        deptList.map(async (d) => {
          try {
            const statsRes = await departmentApi.getStats(d.dept_id);
            // Stats response structure: { success: true, data: { department: {...}, statistics: { totalStudents, totalTeachers, totalCourses } } }
            const stats = (
              statsRes.data.data as {
                statistics?: {
                  totalStudents?: number;
                  totalTeachers?: number;
                  totalCourses?: number;
                };
              }
            )?.statistics;
            return {
              ...d,
              department_code: d.dept_code,
              department_name: d.dept_name,
              total_students: stats?.totalStudents ?? 0,
              total_teachers: stats?.totalTeachers ?? 0,
            };
          } catch (err) {
            console.error(
              `Failed to load stats for department ${d.dept_id}:`,
              err
            );
            return {
              ...d,
              department_code: d.dept_code,
              department_name: d.dept_name,
              total_students: 0,
              total_teachers: 0,
            };
          }
        })
      );
      setDepartments(departmentsWithStats);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (dept: DepartmentWithStats) => {
    setSelectedDepartment(dept);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleFormSubmit = async (
    data: CreateDepartmentData | UpdateDepartmentData
  ) => {
    if (!data) return;
    try {
      setFormLoading(true);
      if (isEdit && selectedDepartment) {
        await departmentApi.update(
          selectedDepartment.dept_id,
          data as UpdateDepartmentData
        );
        toast.success("Department updated successfully");
      } else {
        await departmentApi.create(data as CreateDepartmentData);
        toast.success("Department created successfully");
      }
      setModalOpen(false);
      await loadDepartments();
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

  const handleDelete = (dept: DepartmentWithStats) => {
    setSelectedDepartment(dept);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;
    try {
      await departmentApi.delete(selectedDepartment.dept_id);
      toast.success("Department deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDepartment(null);
      void loadDepartments();
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? error.response?.data?.message
          : "Failed to delete department";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Departments"
        description="Academic departments and their key statistics."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add Department
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments configured"
          description="Create departments in the backend or via APIs to see them here."
        />
      ) : (
        <Table
          data={departments as unknown as Record<string, unknown>[]}
          columns={[
            { key: "department_code", header: "Code" },
            { key: "department_name", header: "Department" },
            { key: "total_students", header: "Students" },
            { key: "total_teachers", header: "Teachers" },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const dept = row as unknown as DepartmentWithStats;
                return (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(dept)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(dept)}
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
          setSelectedDepartment(null);
        }}
        title={isEdit ? "Edit Department" : "Create Department"}
        maxWidth="sm"
      >
        <DepartmentForm
          key={selectedDepartment?.dept_id || "new"}
          initialData={selectedDepartment || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete department "${selectedDepartment?.department_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
