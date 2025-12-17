import { Box, Typography, Container } from "@mui/material";
import { Link } from "react-router";
import { Button } from "@components/common";
import { ErrorOutline } from "@mui/icons-material";

export const NotFound = () => {
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
        <ErrorOutline sx={{ fontSize: 80, color: "text.secondary" }} />
        <Typography variant="h1" fontWeight={700} color="text.secondary">
          404
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Page not found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "500px" }}
        >
          The page you are looking for might have been removed, renamed, or is
          temporarily unavailable.
        </Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          Go back home
        </Button>
      </Box>
    </Container>
  );
};
