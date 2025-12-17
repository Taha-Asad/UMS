import { useEffect, useState } from "react";
import { Box, Button, IconButton, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { feeApi, semesterApi } from "../../api";
import type { Fee, Semester } from "../../api";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Card,
  Modal,
  ConfirmDialog,
} from "../../components/common";
import { FeeForm } from "../../components/forms";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AxiosError } from "axios";

export const Fees = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [semestersRes, currentRes] = await Promise.all([
          semesterApi.getAll(),
          semesterApi.getCurrent(),
        ]);
        setSemesters(semestersRes.data.data || []);
        const current = currentRes.data.data;
        if (current) {
          setSelectedSemester(current.semester_id);
          const feesRes = await feeApi.getBySemester(current.semester_id);
          setFees(feesRes.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load fees:", error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleLoadSemesterFees = async (semesterId: number) => {
    setSelectedSemester(semesterId);
    setLoading(true);
    try {
      const res = await feeApi.getBySemester(semesterId);
      setFees(res.data.data || []);
    } catch (error) {
      console.error("Failed to load fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFee(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (fee: Fee) => {
    setSelectedFee(fee);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (fee: Fee) => {
    setSelectedFee(fee);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<
      Fee,
      "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
    >
  ) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedFee) {
        await feeApi.update(selectedFee.fee_id, data);
        toast.success("Fee updated successfully");
      } else {
        await feeApi.create(data);
        toast.success("Fee created successfully");
      }
      setModalOpen(false);
      if (selectedSemester) {
        const res = await feeApi.getBySemester(selectedSemester);
        setFees(res.data.data || []);
      }
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
    if (!selectedFee) return;
    try {
      await feeApi.delete(selectedFee.fee_id);
      toast.success("Fee deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedFee(null);
      if (selectedSemester) {
        const res = await feeApi.getBySemester(selectedSemester);
        setFees(res.data.data || []);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to delete fee");
      } else {
        toast.error("Failed to delete fee");
      }
    }
  };

  const handleUpdateLateFees = async () => {
    try {
      await feeApi.updateLateFees();
      toast.success("Late fees updated successfully");
      if (selectedSemester) {
        const res = await feeApi.getBySemester(selectedSemester);
        setFees(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update late fees"
      );
    }
  };

  if (loading && fees.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Fees"
        description="Fee structures, challans and collection tracking."
        actions={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={handleUpdateLateFees}>
              Update Late Fees
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
              Create Fee
            </Button>
          </Box>
        }
      />

      {semesters.length > 0 && (
        <Card title="Select Semester" sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {semesters.map((semester) => (
              <Button
                key={semester.semester_id}
                variant={
                  selectedSemester === semester.semester_id
                    ? "contained"
                    : "outlined"
                }
                onClick={() => handleLoadSemesterFees(semester.semester_id)}
              >
                {semester.semester_name} {semester.academic_year}
              </Button>
            ))}
          </Box>
        </Card>
      )}

      <Card
        title="Fee Records"
        description="All fee challans for the selected semester."
      >
        {fees.length === 0 ? (
          <EmptyState
            title="No fee records"
            description="No fees have been generated for this semester yet."
          />
        ) : (
          <Table
            data={fees as unknown as Record<string, unknown>[]}
            columns={[
              { key: "full_name", header: "Student" },
              { key: "roll_number", header: "Roll Number" },
              { key: "fee_type", header: "Type" },
              {
                key: "amount",
                header: "Amount",
                render: (row) => `PKR ${(row.amount as number).toLocaleString()}`,
              },
              {
                key: "paid_amount",
                header: "Paid",
                render: (row) =>
                  `PKR ${((row.paid_amount as number) || 0).toLocaleString()}`,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Chip
                    label={row.status as string}
                    size="small"
                    color={
                      row.status === "paid"
                        ? "success"
                        : row.status === "overdue"
                        ? "error"
                        : row.status === "partial"
                        ? "warning"
                        : "default"
                    }
                  />
                ),
              },
              {
                key: "due_date",
                header: "Due Date",
                render: (row) =>
                  format(new Date(row.due_date as string), "MMM dd, yyyy"),
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(row as Fee)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(row as Fee)}
                        disabled={
                          (row.status as string) === "paid" ||
                          (row.status as string) === "partial"
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
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFee(null);
        }}
        title={isEdit ? "Edit Fee" : "Create Fee"}
        maxWidth="md"
        key={selectedFee?.fee_id || "create-fee"}
      >
        <FeeForm
          initialData={selectedFee || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedFee(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Fee"
        message={`Are you sure you want to delete this fee record? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
