import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

interface TableProps<T> {
  columns: {
    key: keyof T | string;
    header: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  emptyMessage?: string;
}

export const Table = <T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data found",
}: TableProps<T>) => {
  if (data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.header}
                sx={{
                  fontWeight: 600,
                  bgcolor: "action.hover",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: 1,
                }}
              >
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={idx}
              sx={{
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              {columns.map((col) => (
                <TableCell key={col.header}>
                  {col.render
                    ? col.render(row)
                    : (row[col.key as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
};
