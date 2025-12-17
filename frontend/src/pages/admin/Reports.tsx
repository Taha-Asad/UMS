import { Box } from "@mui/material";
import { PageHeader } from "../../components/layout";
import { EmptyState } from "../../components/common";

export const Reports = () => {
  return (
    <Box>
      <PageHeader
        title="Reports"
        description="Downloadable reports for academics, finance and attendance."
      />
      <EmptyState
        title="Reports center"
        description="Pre-built and custom reports will appear here for export."
      />
    </Box>
  );
};
