import { Box } from "@mui/material";
import { PageHeader } from "../../components/layout";
import { EmptyState } from "../../components/common";

export const Notifications = () => {
  return (
    <Box>
      <PageHeader
        title="Notifications"
        description="System and academic alerts for your account."
      />
      <EmptyState
        title="No notifications yet"
        description="Once notification APIs are integrated, you'll see alerts and messages here."
      />
    </Box>
  );
};
