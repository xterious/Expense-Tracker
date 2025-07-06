'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format, isSameMonth } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

interface CategoryBreakdownChartProps {
  data: Transaction[];
  selectedMonth: Date;
  labelLine?: boolean;
  outerRadius?: number;
}

export default function CategoryBreakdownChart({
  data,
  selectedMonth,
  labelLine = false,
  outerRadius = 80,
}: CategoryBreakdownChartProps) {
  // Filter transactions for the selected month
  const monthlyTransactions = data.filter(tx => 
    isSameMonth(new Date(tx.date), selectedMonth)
  );

  const breakdown = monthlyTransactions.reduce<Record<string, number>>((acc, tx) => {
    const amount = tx.quantity * tx.pricePerUnit;
    acc[tx.category] = (acc[tx.category] || 0) + amount;
    return acc;
  }, {});

  const chartData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-muted-foreground">
          No data for {format(selectedMonth, 'MMMM yyyy')}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend
          iconSize={10}
          wrapperStyle={{ fontSize: '12px', wordBreak: 'break-word' }}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          labelLine={labelLine}
          label={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
