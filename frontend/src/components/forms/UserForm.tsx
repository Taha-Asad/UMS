import { useForm } from "react-hook-form";
import { Box, TextField, MenuItem, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import type { RegisterData, UpdateUserData, UserRole } from "../../types";
import { Button } from "../common";
import { ROLES } from "../../utils/constants";
import { departmentApi } from "../../api";
import type { Department } from "../../types";

const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Student", value: "student" },
  { label: "Teacher", value: "teacher" },
  { label: "Administrator", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Librarian", value: "librarian" },
];

interface UserFormProps {
  initialData?: Partial<RegisterData | UpdateUserData>;
  onSubmit: (data: RegisterData | UpdateUserData) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const UserForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: UserFormProps) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegisterData | UpdateUserData>({
    defaultValues: {
      role: ROLES.STUDENT,
      gender: "male",
      full_name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      date_of_birth: "",
    },
  });

  // Load departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await departmentApi.getAll();
        const deptList: Department[] = Array.isArray(res.data.data)
          ? res.data.data
          : (res.data.data as unknown as Department[]) || [];
        setDepartments(deptList);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    };
    void loadDepartments();
  }, []);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      // Format date_of_birth if it's a Date object or string
      const formattedData = {
        ...initialData,
        date_of_birth: initialData.date_of_birth
          ? typeof initialData.date_of_birth === "string"
            ? initialData.date_of_birth.split("T")[0] // Extract date part from ISO string
            : initialData.date_of_birth
          : "",
      };
      reset(formattedData);
    }
  }, [initialData, reset]);

  const role = watch("role");

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Full name"
            fullWidth
            error={!!errors.full_name}
            helperText={errors.full_name?.message}
            {...register("full_name", { required: "Full name is required" })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Username"
            fullWidth
            error={
              !!(errors as unknown as { username?: { message: string } })
                .username
            }
            helperText={
              (errors as unknown as { username?: { message: string } }).username
                ?.message
            }
            disabled={isEdit}
            {...register("username", {
              required: !isEdit ? "Username is required" : false,
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
        </Grid>
        {!isEdit && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              error={
                !!(errors as unknown as { password?: { message: string } })
                  .password
              }
              helperText={
                (errors as unknown as { password?: { message: string } })
                  .password?.message
              }
              {...register("password", {
                required: !isEdit ? "Password is required" : false,
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            label="Role"
            fullWidth
            disabled={isEdit}
            {...register("role", { required: true })}
          >
            {roleOptions.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Date of birth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register("date_of_birth")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField select label="Gender" fullWidth {...register("gender")}>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Phone" fullWidth {...register("phone")} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Address"
            fullWidth
            multiline
            rows={2}
            {...register("address")}
          />
        </Grid>
        {role === "student" && (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Roll number"
                fullWidth
                {...register("roll_number")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Department"
                fullWidth
                {...register("department_id")}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.dept_id} value={dept.dept_name}>
                    {dept.dept_name} ({dept.dept_code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </>
        )}
        {role && ["teacher", "staff", "librarian"].includes(role) && (
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Employee ID"
              fullWidth
              {...register("employee_id")}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" loading={isLoading}>
          {isEdit ? "Update User" : "Create User"}
        </Button>
      </Box>
    </Box>
  );
};
