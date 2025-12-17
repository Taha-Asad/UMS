import { Box } from "@mui/material";
import { PageHeader } from "../../components/layout";
import { EmptyState } from "../../components/common";

export const Settings = () => {
  return (
    <Box>
      <PageHeader
        title="System settings"
        description="Global configuration for the University Management System."
      />
      <EmptyState
        title="Configuration panel"
        description="Institution-level settings, roles and permissions will be configured here."
      />
    </Box>
  );
};
