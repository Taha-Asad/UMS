import { useForm } from "react-hook-form";
import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import type { LoginCredentials } from "../../types";
import { Button } from "../../components/common";
import { useAuth } from "../../hooks";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();
  const { login, isLoading } = useAuth();

  const onSubmit = async (values: LoginCredentials) => {
    setFormError("");
    const result = await login(values);
    if (!result.success && result.error) {
      setFormError(result.error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
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

      <TextField
        label="Username"
        placeholder="Enter your username"
        autoComplete="username"
        fullWidth
        error={!!errors.username}
        helperText={errors.username?.message}
        {...register("username", { required: "Username is required" })}
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        autoComplete="current-password"
        fullWidth
        error={!!errors.password}
        helperText={errors.password?.message}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...register("password", { required: "Password is required" })}
      />

      <Button
        type="submit"
        variant="contained"
        fullWidth
        loading={isLoading}
        sx={{ mt: 1, py: 1.5 }}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </Box>
  );
};
