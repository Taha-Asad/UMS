import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Paper, useTheme } from "@mui/material";

interface BarChartProps<T extends Record<string, unknown>> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
}

export const BarChart = <T extends Record<string, unknown>>({
  data,
  xKey,
  yKey,
}: BarChartProps<T>) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2 }}>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey={xKey as string}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          />
          <Bar
            dataKey={yKey as string}
            fill={theme.palette.primary.main}
            radius={[8, 8, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </Paper>
  );
};
