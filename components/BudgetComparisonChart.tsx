'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BudgetComparison } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BudgetComparisonChartProps {
  data: BudgetComparison[];
}

export default function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <p className="text-muted-foreground">No budget data available</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => {
          const isOverBudget = item.actual > item.budget;
          const progressPercentage = item.budget > 0 ? Math.min((item.actual / item.budget) * 100, 100) : 0;
          
          return (
            <Card key={item.category} className="p-4">
              <div className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{item.category}</h4>
                  <div className="flex items-center space-x-1">
                    {isOverBudget ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : item.actual < item.budget ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      isOverBudget ? 'text-red-600' : 
                      item.actual < item.budget ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={progressPercentage} 
                    className={`h-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Spent: {formatCurrency(item.actual)}</span>
                    <span>Budget: {formatCurrency(item.budget)}</span>
                  </div>
                </div>

                {/* Difference */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Difference:</span>
                  <span className={`text-xs font-medium ${
                    item.difference > 0 ? 'text-red-600' : 
                    item.difference < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {item.difference > 0 ? '+' : ''}{formatCurrency(item.difference)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop Chart View
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
