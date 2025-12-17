import { useForm } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import type { Assessment } from "../../api/assessment.api";
import { Button } from "../common";
import { courseOfferingApi, semesterApi } from "../../api";
import type { CourseOffering } from "../../types";

interface AssessmentFormProps {
  initialData?: Partial<Assessment>;
  onSubmit: (
    data: Omit<Assessment, "assessment_id" | "created_at" | "published">
  ) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  teacherId?: number;
}

export const AssessmentForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  teacherId,
}: AssessmentFormProps) => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [, setSemesterId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (teacherId) {
          const res = await courseOfferingApi.getByTeacher(teacherId);
          setOfferings(
            Array.isArray(res.data.data)
              ? (res.data.data as unknown as CourseOffering[])
              : []
          );
        } else {
          // For admin, load all active offerings
          const semesterRes = await semesterApi.getAll();
          const semesters = Array.isArray(semesterRes.data.data)
            ? semesterRes.data.data
            : [];
          const current = semesters.find((s) => s.is_current);
          if (current) {
            setSemesterId(current.semester_id);
            const res = await courseOfferingApi.getBySemester(
              current.semester_id
            );
            setOfferings(
              Array.isArray(res.data.data)
                ? (res.data.data as unknown as CourseOffering[])
                : []
            );
          }
        }
      } catch (error) {
        console.error("Failed to load course offerings:", error);
      }
    };
    void load();
  }, [teacherId]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<Assessment, "assessment_id" | "created_at" | "published">>({
    defaultValues: initialData || {
      total_marks: 100,
    },
  });

  const onSubmitForm = (
    data: Omit<Assessment, "assessment_id" | "created_at" | "published">
  ) => {
    const submitData = {
      ...data,
      offering_id: Number(data.offering_id),
      total_marks: Number(data.total_marks),
    };
    void onSubmit(submitData);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmitForm)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            label="Course Offering"
            fullWidth
            error={!!errors.offering_id}
            helperText={errors.offering_id?.message}
            disabled={isEdit}
            {...register("offering_id", {
              required: "Course offering is required",
              valueAsNumber: true,
            })}
          >
            {offerings.map((offering) => (
              <MenuItem key={offering.offering_id} value={offering.offering_id}>
                {offering.course_code} - {offering.course_name} (
                {offering.semester_name})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Title"
            fullWidth
            error={!!errors.title}
            helperText={errors.title?.message}
            {...register("title", { required: "Title is required" })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Type"
            fullWidth
            error={!!errors.type}
            helperText={errors.type?.message}
            {...register("type", { required: "Type is required" })}
          >
            <MenuItem value="assignment">Assignment</MenuItem>
            <MenuItem value="quiz">Quiz</MenuItem>
            <MenuItem value="midterm">Midterm</MenuItem>
            <MenuItem value="final">Final</MenuItem>
            <MenuItem value="project">Project</MenuItem>
            <MenuItem value="presentation">Presentation</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Total marks"
            type="number"
            fullWidth
            inputProps={{ min: 0 }}
            error={!!errors.total_marks}
            helperText={errors.total_marks?.message}
            {...register("total_marks", {
              required: "Total marks is required",
              valueAsNumber: true,
              min: { value: 0, message: "Must be positive" },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Due date"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.due_date}
            helperText={errors.due_date?.message}
            {...register("due_date", { required: "Due date is required" })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            {...register("description")}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Assessment" : "Create Assessment"}
        </Button>
      </Box>
    </Box>
  );
};
