import {
  Container,
  Box,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router";
import { LoginForm } from "../../components/forms";
import { Card } from "../../components/common";
import { APP_SHORT_NAME } from "../../utils/constants";

export const Login = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 4,
            alignItems: "stretch",
          }}
        >
          {/* Left hero panel */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              p: 4,
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "space-between",
              bgcolor: "primary.dark",
              backgroundImage:
                "linear-gradient(135deg, #0088a0 0%, #00a6c0 100%)",
              color: "white",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.5,
                  borderRadius: 3,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  mb: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, letterSpacing: 2 }}
                >
                  {APP_SHORT_NAME} Portal
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Modern{" "}
                <Box
                  component="span"
                  sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  University Management
                </Box>{" "}
                experience.
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 2, opacity: 0.9, maxWidth: "500px" }}
              >
                Access your courses, results, fees and library records from a
                single, beautifully crafted dashboard tailored to your role.
              </Typography>
            </Box>

            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mt: 4 }}>
              {[
                "Real-time dashboards for students, teachers and admins",
                "Secure role-based access with audit logging",
                "Responsive layout that works great on mobile and desktop",
              ].map((item, idx) => (
                <Box
                  key={idx}
                  component="li"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "white",
                    }}
                  />
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Right auth card */}
          <Box
            sx={{ flex: 1, maxWidth: { xs: "100%", lg: "500px" }, mx: "auto" }}
          >
            <Box sx={{ mb: 4, textAlign: { xs: "center", lg: "left" } }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                gutterBottom
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in with your university credentials to continue.
              </Typography>
            </Box>

            <Card>
              <LoginForm />
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    fontSize: "0.875rem",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Forgot your password?
                    </Typography>
                    <MuiLink
                      component={Link}
                      to="/forgot-password"
                      color="primary"
                    >
                      Reset it
                    </MuiLink>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      New here?
                    </Typography>
                    <MuiLink component={Link} to="/register" color="primary">
                      Create an account
                    </MuiLink>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
