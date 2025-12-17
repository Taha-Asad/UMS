import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  actions,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        mb: { xs: 3, sm: 4 },
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{
            background: "linear-gradient(135deg, #00a6c0, #00a6e0)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: description ? 1 : 0,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "800px" }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {actions && (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      )}
    </Box>
  );
};
