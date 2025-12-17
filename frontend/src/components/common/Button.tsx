import { Button as MuiButton, CircularProgress } from "@mui/material";
import type { ButtonProps as MuiButtonProps } from "@mui/material";
interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "contained" | "outlined" | "text";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = ({
  variant = "contained",
  fullWidth,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <MuiButton
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          {children}
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};
