import { Container, Box } from "@mui/material";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { authApi } from "../../api/auth.api";
import { Card, Button, Input, Alert } from "../../components/common";

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirmPassword) {
      setStatus("error");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword(token, password);
      setStatus("success");
    } catch {
      setStatus("error");
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
          title="Set a new password"
          description={
            token
              ? "Choose a strong password for your account."
              : "Missing or invalid reset token. Please use the link from your email."
          }
        >
          {!token ? (
            <Alert
              variant="error"
              title="Invalid link"
              description="The password reset link is invalid or has expired."
            />
          ) : (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                fullWidth
              />
              {status === "error" && (
                <Alert
                  variant="error"
                  title="Could not reset password"
                  description="Please check the link and try again."
                />
              )}
              {status === "success" && (
                <Alert
                  variant="success"
                  title="Password updated"
                  description="You can now sign in with your new password."
                />
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
              >
                {loading ? "Updating..." : "Update password"}
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
};
