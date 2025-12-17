import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Paper, useTheme } from "@mui/material";

interface PieChartProps<T extends Record<string, unknown>> {
  data: T[];
  dataKey: keyof T;
  nameKey: keyof T;
}

export const PieChart = <T extends Record<string, unknown>>({
  data,
  dataKey,
  nameKey,
}: PieChartProps<T>) => {
  const theme = useTheme();

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey as string}
            nameKey={nameKey as string}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Paper>
  );
};
