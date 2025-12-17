import { Box, Typography, Container } from "@mui/material";
import { Link } from "react-router";
import { Button } from "@components/common";
import { Lock } from "@mui/icons-material";

export const Unauthorized = () => {
  return (
    <Container>
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          textAlign: "center",
        }}
      >
        <Lock sx={{ fontSize: 80, color: "warning.main" }} />
        <Typography variant="h1" fontWeight={700} color="warning.main">
          403
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Access denied
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "500px" }}
        >
          You don't have permission to view this page with your current role.
          Try switching accounts or contact an administrator.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          Go to dashboard
        </Button>
      </Box>
    </Container>
  );
};
