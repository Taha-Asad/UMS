import { Box, Typography, Container } from "@mui/material";
import { Link } from "react-router";
import { Button } from "@components/common";
import { Error } from "@mui/icons-material";

export const ServerError = () => {
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
        <Error sx={{ fontSize: 80, color: "error.main" }} />
        <Typography variant="h1" fontWeight={700} color="error.main">
          500
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Something went wrong
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "500px" }}
        >
          An unexpected error occurred while loading the application. Please try
          again, or contact support if the problem persists.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          Reload dashboard
        </Button>
      </Box>
    </Container>
  );
};
