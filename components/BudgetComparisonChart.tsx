'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetComparison } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BudgetComparisonChartProps {
  data: BudgetComparison[];
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-muted-foreground">No budget data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="category" 
          fontSize={12}
          tick={{ fill: '#666' }}
        />
        <YAxis 
          fontSize={12}
          tick={{ fill: '#666' }}
          tickFormatter={(value) => `₹${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === 'budget' ? 'Budget' : 'Actual'
          ]}
        />
        <Legend />
        <Bar dataKey="budget" fill="#8884d8" name="Budget" />
        <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
      </BarChart>
    </ResponsiveContainer>
  );
}
