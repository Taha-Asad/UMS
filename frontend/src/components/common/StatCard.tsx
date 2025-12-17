import { Card, CardContent, Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  helper?: string;
  trend?: "up" | "down" | "neutral";
}

export const StatCard = ({ label, value, icon, helper }: StatCardProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              fontWeight={700}
              sx={{ mt: 1, mb: 0.5 }}
            >
              {value}
            </Typography>
            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
