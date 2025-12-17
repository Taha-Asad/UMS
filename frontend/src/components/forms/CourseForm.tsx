import { useForm } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import type { CreateCourseData, UpdateCourseData } from "../../types";
import { Button } from "../common";
import { departmentApi } from "../../api";
import type { Department } from "../../types";

interface CourseFormProps {
  initialData?: Partial<CreateCourseData | UpdateCourseData>;
  onSubmit: (data: CreateCourseData | UpdateCourseData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const CourseForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: CourseFormProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await departmentApi.getAll();
        setDepartments(res.data.data || []);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    };
    void load();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseData | UpdateCourseData>({
    defaultValues: {
      credits: 3,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        credits: initialData.credits || 3,
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
            label="Course code"
            fullWidth
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error={!!(errors as any).course_code}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            helperText={(errors as any).course_code?.message}
            disabled={isEdit}
            {...register(
              "course_code" as keyof CreateCourseData | keyof UpdateCourseData,
              {
                required: !isEdit ? "Course code is required" : false,
              }
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Course name"
            fullWidth
            error={!!errors.course_name}
            helperText={errors.course_name?.message}
            {...register("course_name", {
              required: "Course name is required",
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Credits"
            type="number"
            fullWidth
            inputProps={{ min: 1, max: 6 }}
            error={!!errors.credits}
            helperText={errors.credits?.message}
            {...register("credits", {
              required: "Credits is required",
              valueAsNumber: true,
              min: { value: 1, message: "Minimum 1 credit" },
              max: { value: 6, message: "Maximum 6 credits" },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Department"
            fullWidth
            error={!!errors.department_id}
            helperText={errors.department_id?.message}
            {...register("department_id", {
              required: "Department is required",
              valueAsNumber: true,
            })}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.dept_id} value={dept.dept_id}>
                {dept.dept_name} ({dept.dept_code})
              </MenuItem>
            ))}
          </TextField>
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
          {isEdit ? "Update Course" : "Create Course"}
        </Button>
      </Box>
    </Box>
  );
};
