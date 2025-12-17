import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import type { Fee } from "../../api/fee.api";
import { Button } from "../common";
import { userApi, semesterApi } from "../../api";
import type { StudentProfile, Semester } from "../../types";
import toast from "react-hot-toast";

interface FeeFormProps {
  initialData?: Partial<Fee>;
  onSubmit: (
    data: Omit<
      Fee,
      "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
    >
  ) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const feeTypes = [
  { value: "tuition", label: "Tuition" },
  { value: "hostel", label: "Hostel" },
  { value: "library", label: "Library" },
  { value: "laboratory", label: "Laboratory" },
  { value: "sports", label: "Sports" },
  { value: "exam", label: "Exam" },
  { value: "other", label: "Other" },
];

export const FeeForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: FeeFormProps) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    Omit<Fee, "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at">
  >({
    defaultValues: {},
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, semestersRes] = await Promise.all([
          userApi.getStudents().catch(() => ({ data: { data: [] } })),
          semesterApi.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        const studentsData = Array.isArray(studentsRes.data.data)
          ? studentsRes.data.data
          : [];
        setStudents(studentsData);

        const semestersData = Array.isArray(semestersRes.data.data)
          ? semestersRes.data.data
          : [];
        setSemesters(semestersData);
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Failed to load form data");
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
      });
    }
  }, [initialData, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(
        onSubmit as SubmitHandler<
          Omit<
            Fee,
            "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
          >
        >
      )}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Student"
            fullWidth
            error={!!errors.student_id}
            helperText={errors.student_id?.message}
            disabled={isEdit}
            {...register("student_id", {
              required: "Student is required",
              valueAsNumber: true,
            })}
          >
            <MenuItem value="">Select a student</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.user_id} value={student.user_id}>
                {student.full_name} ({student.roll_number || student.email})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Semester"
            fullWidth
            error={!!errors.semester_id}
            helperText={errors.semester_id?.message}
            disabled={isEdit}
            {...register("semester_id", {
              required: "Semester is required",
              valueAsNumber: true,
            })}
          >
            <MenuItem value="">Select a semester</MenuItem>
            {semesters.map((semester) => (
              <MenuItem key={semester.semester_id} value={semester.semester_id}>
                {semester.semester_name} {semester.academic_year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Fee Type"
            fullWidth
            error={!!errors.fee_type}
            helperText={errors.fee_type?.message}
            {...register("fee_type", { required: "Fee type is required" })}
          >
            {feeTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            error={!!errors.amount}
            helperText={errors.amount?.message}
            {...register("amount", {
              required: "Amount is required",
              valueAsNumber: true,
              min: { value: 0, message: "Amount must be positive" },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Discount"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            error={
              !!(errors as unknown as { discount?: { message: string } })
                .discount
            }
            helperText={
              (errors as unknown as { discount?: { message: string } }).discount
                ?.message
            }
            {...register(
              "discount" as keyof Omit<
                Fee,
                "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
              >,
              {
                valueAsNumber: true,
                min: { value: 0, message: "Discount cannot be negative" },
              }
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.due_date}
            helperText={errors.due_date?.message}
            {...register("due_date", {
              required: "Due date is required",
            })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={3}
            {...register(
              "remarks" as keyof Omit<
                Fee,
                "fee_id" | "paid_amount" | "status" | "created_at" | "paid_at"
              >
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Fee" : "Create Fee"}
        </Button>
      </Box>
    </Box>
  );
};
