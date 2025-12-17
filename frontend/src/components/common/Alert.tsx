import { Alert as MuiAlert, AlertTitle } from "@mui/material";
import type { AlertProps as MuiAlertProps } from "@mui/material";
type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  title?: string;
  description?: string;
  variant?: AlertVariant;
}

const severityMap: Record<AlertVariant, MuiAlertProps["severity"]> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

export const Alert = ({ title, description, variant = "info" }: AlertProps) => {
  return (
    <MuiAlert severity={severityMap[variant]} sx={{ mb: 2 }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description}
    </MuiAlert>
  );
};
