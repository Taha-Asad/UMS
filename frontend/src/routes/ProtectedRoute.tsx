import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Box, Typography } from "@mui/material";
import type { UserRole } from "@types";
import { useAuth } from "@hooks";
import { Spinner } from "@components/common";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      void checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <Spinner size="lg" />
        <Typography variant="body2" color="text.secondary">
          Checking authentication, please wait...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
