import { Pagination as MuiPagination, Box } from "@mui/material";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onChange(value)}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
};
