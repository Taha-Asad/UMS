import { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { userApi } from "../../api";
import type { User } from "../../types";
import { PageHeader } from "../../components/layout";
import { Card, Spinner, EmptyState } from "../../components/common";

export const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userApi.getProfile();
        setUser(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Profile"
        description="Your basic account and contact information."
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Spinner />
        </Box>
      ) : !user ? (
        <EmptyState
          title="Profile not found"
          description="We could not load your profile data from the server."
        />
      ) : (
        <Card>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Full name
                </Box>
                <Box sx={{ fontWeight: 600 }}>{user.full_name}</Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Username
                </Box>
                <Box sx={{ fontWeight: 600 }}>{user.username}</Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Email
                </Box>
                <Box sx={{ fontWeight: 600 }}>{user.email}</Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box>
                <Box
                  sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}
                >
                  Role
                </Box>
                <Box sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                  {user.role}
                </Box>
              </Box>
            </Grid>
            {user.department_name && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Box
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    Department
                  </Box>
                  <Box sx={{ fontWeight: 600 }}>{user.department_name}</Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>
      )}
    </Box>
  );
};
