// components/forms/DepartmentForm.tsx
import { useForm } from "react-hook-form";
import { Box, TextField, Grid } from "@mui/material";
import { useEffect } from "react";
import { Button } from "../common";

interface DepartmentFormData {
  dept_code: string;
  dept_name: string;
  description?: string;
}

interface DepartmentFormProps {
  initialData?: Partial<DepartmentFormData>;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const DepartmentForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: DepartmentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    defaultValues: {
      dept_code: "",
      dept_name: "",
      description: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        dept_code: initialData.dept_code || "",
        dept_name: initialData.dept_name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Department Code"
            fullWidth
            error={!!errors.dept_code}
            helperText={errors.dept_code?.message}
            disabled={isEdit}
            {...register("dept_code", {
              required: !isEdit ? "Department code is required" : false,
              maxLength: {
                value: 10,
                message: "Maximum 10 characters",
              },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Department Name"
            fullWidth
            error={!!errors.dept_name}
            helperText={errors.dept_name?.message}
            {...register("dept_name", {
              required: "Department name is required",
              maxLength: {
                value: 100,
                message: "Maximum 100 characters",
              },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register("description")}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Department" : "Create Department"}
        </Button>
      </Box>
    </Box>
  );
};
