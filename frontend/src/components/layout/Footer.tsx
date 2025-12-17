import { Box, Typography, Container } from "@mui/material";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            &copy; {year} University Management System. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Built with React, Material UI, React Router & Zustand
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
