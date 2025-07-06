"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { MonthlyData } from "@/types";
interface MonthlyExpensesChartProps {
  data: MonthlyData[];
}
export default function MonthlyExpensesChart({
  data,
}: MonthlyExpensesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          tickFormatter={(tick) => format(parseISO(`${tick}-01`), "MMM yy")}
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [
            formatCurrency(value),
            "Total Expenses",
          ]}
          labelFormatter={(label) =>
            format(parseISO(`${label}-01`), "MMMM yyyy")
          }
        />
        <Legend />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
