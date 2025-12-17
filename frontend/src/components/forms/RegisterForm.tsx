import { useForm, useWatch } from "react-hook-form";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import type { RegisterData, UserRole } from "../../types";
import { Button } from "../../components/common";
import { useAuth } from "../../hooks";
import { ROLES } from "../../utils/constants";
import { useState } from "react";

const roleOptions: { label: string; value: UserRole }[] = [
  { label: "Student", value: "student" },
  { label: "Teacher", value: "teacher" },
  { label: "Administrator", value: "admin" },
  { label: "Staff", value: "staff" },
  { label: "Librarian", value: "librarian" },
];

type RegisterFormData = RegisterData & {
  confirm_password?: string;
};

export const RegisterForm = () => {
  const [formError, setFormError] = useState<string>("");
  const {
    register: rhfRegister,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
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

  const role = useWatch({ control, name: "role" });
  const password = watch("password");
  const confirmPassword = watch("confirm_password");
  const { register: authRegister, isLoading } = useAuth();

  const onSubmit = async (values: RegisterFormData) => {
    setFormError("");

    if (values.password !== values.confirm_password) {
      setFormError("Passwords do not match");
      return;
    }

    if (values.password && values.password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    const payload: RegisterData = {
      username: values.username || "",
      password: values.password || "",
      email: values.email || "",
      full_name: values.full_name || "",
      role: values.role || ROLES.STUDENT,
      gender: values.gender || "male",
      date_of_birth: values.date_of_birth || "",
      phone: values.phone || "",
      address: values.address || "",
      roll_number: values.roll_number,
      employee_id: values.employee_id,
    };

    const result = await authRegister(payload);
    if (!result.success && result.error) {
      setFormError(result.error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      {formError && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "error.dark",
            color: "error.contrastText",
            fontSize: "0.875rem",
          }}
        >
          {formError}
        </Box>
      )}

      {/* Personal Information */}
      <Box>
        <Typography
          variant="overline"
          sx={{ fontWeight: 600, letterSpacing: 1, mb: 2, display: "block" }}
        >
          Personal Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Full name"
              placeholder="John Doe"
              fullWidth
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              {...rhfRegister("full_name", {
                required: "Full name is required",
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Username"
              placeholder="johndoe"
              fullWidth
              error={!!errors.username}
              helperText={errors.username?.message}
              {...rhfRegister("username", { required: "Username is required" })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              {...rhfRegister("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phone"
              placeholder="0300-1234567"
              fullWidth
              {...rhfRegister("phone")}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Account Security */}
      <Box>
        <Typography
          variant="overline"
          sx={{ fontWeight: 600, letterSpacing: 1, mb: 2, display: "block" }}
        >
          Account Security
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Password"
              type="password"
              placeholder="Create a strong password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              {...rhfRegister("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Confirm password"
              type="password"
              placeholder="Repeat password"
              fullWidth
              error={
                !!errors.confirm_password ||
                !!(confirmPassword && confirmPassword !== password)
              }
              helperText={
                errors.confirm_password?.message ||
                (confirmPassword && confirmPassword !== password
                  ? "Passwords do not match"
                  : undefined)
              }
              {...rhfRegister("confirm_password", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Role & Details */}
      <Box>
        <Typography
          variant="overline"
          sx={{ fontWeight: 600, letterSpacing: 1, mb: 2, display: "block" }}
        >
          Role & Details
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label="Role"
              fullWidth
              defaultValue={ROLES.STUDENT}
              {...rhfRegister("role", { required: true })}
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
              {...rhfRegister("date_of_birth")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              label="Gender"
              fullWidth
              defaultValue="male"
              {...rhfRegister("gender")}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>

          {/* Role-specific fields */}
          {role === "student" && (
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Roll number"
                placeholder="BSCS-2023-045"
                fullWidth
                error={!!errors.roll_number}
                helperText={errors.roll_number?.message}
                {...rhfRegister("roll_number", {
                  required:
                    role === "student" ? "Roll number is required" : false,
                })}
              />
            </Grid>
          )}

          {role && ["teacher", "staff", "librarian"].includes(role) && (
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Employee ID"
                placeholder="EMP-1024"
                fullWidth
                error={!!errors.employee_id}
                helperText={errors.employee_id?.message}
                {...rhfRegister("employee_id", {
                  required: ["teacher", "staff", "librarian"].includes(role)
                    ? "Employee ID is required"
                    : false,
                })}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Divider />

      {/* Address */}
      <Box>
        <Typography
          variant="overline"
          sx={{ fontWeight: 600, letterSpacing: 1, mb: 2, display: "block" }}
        >
          Address
        </Typography>
        <TextField
          label="Address"
          placeholder="House, street, city"
          fullWidth
          multiline
          rows={2}
          {...rhfRegister("address")}
        />
      </Box>

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        loading={isLoading}
        sx={{ py: 1.5 }}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </Box>
  );
};
