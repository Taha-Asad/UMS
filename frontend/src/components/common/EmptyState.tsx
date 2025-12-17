import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 6,
        textAlign: "center",
        border: 2,
        borderColor: "divider",
        borderStyle: "dashed",
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            bgcolor: "action.selected",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            color: "text.secondary",
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: "400px", mb: 2 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
};
