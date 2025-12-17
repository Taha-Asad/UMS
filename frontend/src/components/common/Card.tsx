import { Card as MuiCard, CardContent, CardHeader, Box } from "@mui/material";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sx?: any;
}

export const Card = ({
  title,
  description,
  children,
  footer,
  sx,
}: CardProps) => {
  return (
    <MuiCard
      sx={{
        boxShadow: 3,
        ...sx,
      }}
    >
      {(title || description) && (
        <CardHeader
          title={title}
          subheader={description}
          titleTypographyProps={{
            variant: "h6",
            fontWeight: 600,
          }}
          subheaderTypographyProps={{
            variant: "body2",
            color: "text.secondary",
          }}
        />
      )}
      <CardContent sx={{ pt: title ? 0 : 3 }}>{children}</CardContent>
      {footer && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          {footer}
        </Box>
      )}
    </MuiCard>
  );
};
