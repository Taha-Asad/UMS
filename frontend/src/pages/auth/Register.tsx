import {
  Container,
  Box,
  Typography,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router";
import { RegisterForm } from "../../components/forms";
import { Card } from "../../components/common";
import { APP_NAME, APP_SHORT_NAME } from "../../utils/constants";

export const Register = () => {
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
          {/* Left intro panel */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              p: 4,
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "success.dark",
              backgroundImage:
                "linear-gradient(135deg, #059669 0%, #10b981 100%)",
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
                  {APP_SHORT_NAME} Registration
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Join{" "}
                <Box
                  component="span"
                  sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                >
                  {APP_NAME}
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 2, opacity: 0.9, maxWidth: "500px" }}
              >
                One account gives you access to your courses, results, biometric
                attendance, fees, timetable and library data.
              </Typography>
            </Box>

            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mt: 4 }}>
              {[
                "Complete academic profile management",
                "Secure authentication with role-based access",
                "Real-time updates and notifications",
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

          {/* Right form card */}
          <Box
            sx={{ flex: 1, maxWidth: { xs: "100%", lg: "700px" }, mx: "auto" }}
          >
            <Box sx={{ mb: 4, textAlign: { xs: "center", lg: "left" } }}>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                gutterBottom
              >
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tell us a few details to set up your account.
              </Typography>
            </Box>

            <Card>
              <RegisterForm />
              <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    fontSize: "0.75rem",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    By creating an account, you agree to our{" "}
                    <MuiLink component={Link} to="/terms" color="primary">
                      Terms
                    </MuiLink>{" "}
                    and{" "}
                    <MuiLink component={Link} to="/privacy" color="primary">
                      Privacy Policy
                    </MuiLink>
                    .
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <MuiLink component={Link} to="/login" color="primary">
                      Sign in
                    </MuiLink>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
