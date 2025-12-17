import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const colorMap: Record<BadgeVariant, ChipProps["color"]> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "error",
  info: "info",
};

export const Badge = ({
  children,
  variant = "primary",
  className,
}: BadgeProps) => {
  return (
    <Chip
      label={children}
      color={colorMap[variant]}
      size="small"
      className={className}
    />
  );
};
