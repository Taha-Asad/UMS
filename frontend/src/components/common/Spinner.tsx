import { CircularProgress, Box } from "@mui/material";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export const Spinner = ({ size = "md", className }: SpinnerProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      className={className}
    >
      <CircularProgress size={sizeMap[size]} />
    </Box>
  );
};
