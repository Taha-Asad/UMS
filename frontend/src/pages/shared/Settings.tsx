import { Box } from "@mui/material";
import { PageHeader } from "../../components/layout";
import { EmptyState } from "../../components/common";

export const Settings = () => {
  return (
    <Box>
      <PageHeader
        title="Account settings"
        description="Update your personal information and change password."
      />
      <EmptyState
        title="Settings coming soon"
        description="Profile update and password change forms will be wired here using the auth and user APIs."
      />
    </Box>
  );
};
