'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Transaction } from '@/types'; // Import from the central types file

interface MonthlyExpensesChartProps {
  data: Transaction[];
}

export default function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  // Aggregate data by month with proper total calculation using quantity * pricePerUnit
  const monthlyData = data.reduce((acc, transaction) => {
    const month = format(parseISO(transaction.date), 'yyyy-MM');
    // Calculate total amount from quantity and pricePerUnit
    const totalAmount = transaction.quantity * transaction.pricePerUnit;
    const existingMonth = acc.find(d => d.name === month);

    if (existingMonth) {
      existingMonth.total += totalAmount;
    } else {
      acc.push({ name: month, total: totalAmount });
    }
    return acc;
  }, [] as { name: string; total: number }[]);

  // Sort by month for chronological order
  const sortedMonthlyData = monthlyData.sort((a, b) => a.name.localeCompare(b.name));

  if (sortedMonthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available to display chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedMonthlyData}>
        <XAxis 
          dataKey="name" 
          tickFormatter={(tick) => format(parseISO(`${tick}-01`), 'MMM yyyy')}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total Expenses']}
          labelFormatter={(label) => format(parseISO(`${label}-01`), 'MMMM yyyy')}
        />
        <Legend />
        <Bar 
          dataKey="total" 
          fill="#8884d8" 
          name="Monthly Expenses" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
