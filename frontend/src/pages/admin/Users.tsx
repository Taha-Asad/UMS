import { useEffect, useState } from "react";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";
import { userApi, authApi } from "../../api";
import type { User, RegisterData, UpdateUserData } from "../../types";
import { PageHeader } from "../../components/layout";
import {
  Table,
  EmptyState,
  Spinner,
  Modal,
  ConfirmDialog,
  Button,
} from "../../components/common";
import { UserForm } from "../../components/forms";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      setUsers(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsEdit(false);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEdit(true);
    setModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: RegisterData | UpdateUserData) => {
    try {
      setFormLoading(true);
      if (isEdit && selectedUser) {
        await userApi.update(selectedUser.user_id, data as UpdateUserData);
        toast.success("User updated successfully");
      } else {
        // Use auth register endpoint for creating users
        await authApi.register(data as RegisterData);
        toast.success("User created successfully");
      }
      setModalOpen(false);
      void loadUsers();
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
    if (!selectedUser) return;
    try {
      await userApi.delete(selectedUser.user_id);
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      void loadUsers();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to delete user");
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        description="Manage student, teacher, staff and admin accounts."
        actions={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            Add User
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Once users exist in the system, they will be listed here."
        />
      ) : (
        <Table
          data={users as unknown as Record<string, unknown>[]}
          columns={[
            { key: "username", header: "Username" },
            { key: "full_name", header: "Name" },
            { key: "email", header: "Email" },
            {
              key: "role",
              header: "Role",
              render: (row) => (
                <Chip
                  label={(row.role as string).toUpperCase()}
                  size="small"
                  color={
                    row.role === "admin"
                      ? "error"
                      : row.role === "teacher"
                      ? "primary"
                      : "default"
                  }
                />
              ),
            },
            {
              key: "is_active",
              header: "Status",
              render: (row) => (
                <Chip
                  label={row.is_active ? "Active" : "Inactive"}
                  size="small"
                  color={row.is_active ? "success" : "default"}
                />
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(row as User)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row as User)}
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
          setSelectedUser(null);
        }}
        title={isEdit ? "Edit User" : "Create User"}
        maxWidth="md"
      >
        <UserForm
          key={selectedUser?.user_id || "new"}
          initialData={selectedUser || undefined}
          onSubmit={handleFormSubmit}
          isLoading={formLoading}
          isEdit={isEdit}
        />
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.full_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </Box>
  );
};
