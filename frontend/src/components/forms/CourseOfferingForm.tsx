import { useForm } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "../common";
import { courseApi, semesterApi, userApi } from "../../api";
import type { Course, Semester, CourseOffering } from "../../types";
import type { TeacherProfile } from "../../types";

interface CourseOfferingFormData {
  course_id: number;
  semester_id: number;
  teacher_id?: number;
  room_number?: string;
  max_students?: number;
}

interface CourseOfferingFormProps {
  initialData?: Partial<CourseOffering>;
  onSubmit: (data: CourseOfferingFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const CourseOfferingForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: CourseOfferingFormProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [coursesRes, semestersRes, teachersRes] = await Promise.all([
          courseApi.getAll(),
          semesterApi.getAll(),
          userApi.getTeachers(),
        ]);

        // Handle different response structures
        const coursesData = Array.isArray(coursesRes.data.data)
          ? coursesRes.data.data
          : (coursesRes.data.data as unknown as Course[]) || [];

        const semestersData = Array.isArray(semestersRes.data.data)
          ? semestersRes.data.data
          : (semestersRes.data.data as unknown as Semester[]) || [];

        const teachersData = Array.isArray(teachersRes.data.data)
          ? teachersRes.data.data
          : (teachersRes.data.data as unknown as TeacherProfile[]) || [];

        setCourses(coursesData);
        setSemesters(semestersData);
        setTeachers(teachersData);
      } catch (error) {
        console.error("Failed to load form data:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseOfferingFormData>({
    defaultValues: {
      course_id: initialData?.course_id || 0,
      semester_id: initialData?.semester_id || 0,
      teacher_id: initialData?.teacher_id || undefined,
      room_number: initialData?.room_number || "",
      max_students: initialData?.max_students || 40,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        course_id: initialData.course_id || 0,
        semester_id: initialData.semester_id || 0,
        teacher_id: initialData.teacher_id || undefined,
        room_number: initialData.room_number || "",
        max_students: initialData.max_students || 40,
      });
    }
  }, [initialData, reset]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        Loading form data...
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            select
            label="Course"
            fullWidth
            error={!!errors.course_id}
            helperText={errors.course_id?.message}
            disabled={isEdit}
            {...register("course_id", {
              required: "Course is required",
              valueAsNumber: true,
            })}
          >
            {courses.map((course) => (
              <MenuItem key={course.course_id} value={course.course_id}>
                {course.course_code} - {course.course_name}
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
            {semesters.map((semester) => (
              <MenuItem key={semester.semester_id} value={semester.semester_id}>
                {semester.semester_name} ({semester.academic_year})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Teacher"
            fullWidth
            error={!!errors.teacher_id}
            helperText={
              errors.teacher_id?.message || "Optional - can be assigned later"
            }
            {...register("teacher_id", {
              valueAsNumber: true,
            })}
          >
            <MenuItem value="">No teacher assigned</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.user_id} value={teacher.user_id}>
                {teacher.full_name} ({teacher.employee_id || teacher.email})
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Room Number"
            fullWidth
            error={!!errors.room_number}
            helperText={errors.room_number?.message}
            {...register("room_number")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Max Students"
            type="number"
            fullWidth
            inputProps={{ min: 1, max: 200 }}
            error={!!errors.max_students}
            helperText={errors.max_students?.message}
            {...register("max_students", {
              valueAsNumber: true,
              min: { value: 1, message: "Minimum 1 student" },
              max: { value: 200, message: "Maximum 200 students" },
            })}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Offering" : "Create Offering"}
        </Button>
      </Box>
    </Box>
  );
};
