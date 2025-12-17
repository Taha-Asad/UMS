import { Container, Box, Typography } from "@mui/material";
import { useState } from "react";
import { authApi } from "@api/auth.api";
import { Card, Button, Input, Alert } from "@components/common";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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
      <Container maxWidth="sm">
        <Card
          title="Reset your password"
          description="Enter your registered email to receive a reset link."
        >
          {submitted ? (
            <Alert
              variant="success"
              title="Email sent"
              description="If an account exists with that email, a reset link has been sent."
            />
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
};
