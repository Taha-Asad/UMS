import { useForm } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { Button } from "../common";
import { courseOfferingApi } from "../../api";
import type { CourseOffering } from "../../types";
import type { TimetableEntry } from "../../api/timetable.api";

interface TimetableFormData {
  offering_id: number;
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  start_time: string;
  end_time: string;
  room_number: string;
}

interface TimetableFormProps {
  initialData?: Partial<TimetableEntry>;
  semesterId?: number;
  onSubmit: (data: TimetableFormData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const TimetableForm = ({
  initialData,
  semesterId,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: TimetableFormProps) => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!semesterId) return;
      try {
        setLoading(true);
        const res = await courseOfferingApi.getBySemester(semesterId);
        const offeringsData: CourseOffering[] = Array.isArray(res.data.data)
          ? (res.data.data as unknown as CourseOffering[])
          : [];
        setOfferings(offeringsData);
      } catch (error) {
        console.error("Failed to load course offerings:", error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [semesterId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimetableFormData>({
    defaultValues: {
      offering_id: initialData?.offering_id || 0,
      day_of_week: initialData?.day_of_week || "Monday",
      start_time: initialData?.start_time || "09:00",
      end_time: initialData?.end_time || "10:30",
      room_number: initialData?.room_number || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        offering_id: initialData.offering_id || 0,
        day_of_week: initialData.day_of_week || "Monday",
        start_time: initialData.start_time || "09:00",
        end_time: initialData.end_time || "10:30",
        room_number: initialData.room_number || "",
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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
                {offering.course_code} - {offering.course_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Day of Week"
            fullWidth
            error={!!errors.day_of_week}
            helperText={errors.day_of_week?.message}
            {...register("day_of_week", {
              required: "Day is required",
            })}
          >
            {days.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="Start Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.start_time}
            helperText={errors.start_time?.message}
            {...register("start_time", {
              required: "Start time is required",
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            label="End Time"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={!!errors.end_time}
            helperText={errors.end_time?.message}
            {...register("end_time", {
              required: "End time is required",
            })}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Room Number"
            fullWidth
            error={!!errors.room_number}
            helperText={errors.room_number?.message}
            {...register("room_number", {
              required: "Room number is required",
            })}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update Schedule" : "Create Schedule"}
        </Button>
      </Box>
    </Box>
  );
};
