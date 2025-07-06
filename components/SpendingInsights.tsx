'use client';

import { useState } from 'react';
import { SpendingInsight } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface SpendingInsightsProps {
  insights: SpendingInsight;
}

export default function SpendingInsights({ insights }: SpendingInsightsProps) {
  const [showAllOver, setShowAllOver] = useState(false);
  const [showAllUnder, setShowAllUnder] = useState(false);

  const overBudgetPercentage = insights.totalBudget > 0 
    ? ((insights.totalSpent / insights.totalBudget) * 100) 
    : 0;

  // Limit categories shown initially
  const maxVisible = 3;
  const visibleOverCategories = showAllOver 
    ? insights.overBudgetCategories 
    : insights.overBudgetCategories.slice(0, maxVisible);
  const visibleUnderCategories = showAllUnder 
    ? insights.underBudgetCategories 
    : insights.underBudgetCategories.slice(0, maxVisible);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Overall Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          {overBudgetPercentage > 100 ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overBudgetPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(insights.totalSpent)} of {formatCurrency(insights.totalBudget)}
          </p>
        </CardContent>
      </Card>

      {/* Biggest Overspend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Overspend</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {insights.biggestOverspend ? (
            <>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(insights.biggestOverspend.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.biggestOverspend.category}
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No overspending</div>
          )}
        </CardContent>
      </Card>

      {/* Biggest Underspend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Biggest Savings</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {insights.biggestUnderspend ? (
            <>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(insights.biggestUnderspend.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {insights.biggestUnderspend.category}
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No savings</div>
          )}
        </CardContent>
      </Card>

      {/* Compact Categories Summary */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Category Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Over Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-600">Over Budget ({insights.overBudgetCategories.length})</p>
                {insights.overBudgetCategories.length > maxVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllOver(!showAllOver)}
                    className="h-6 px-2 text-xs"
                  >
                    {showAllOver ? (
                      <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>Show All <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              {visibleOverCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {visibleOverCategories.map(category => (
                    <span 
                      key={category} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>

            {/* Under Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-600">Under Budget ({insights.underBudgetCategories.length})</p>
                {insights.underBudgetCategories.length > maxVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllUnder(!showAllUnder)}
                    className="h-6 px-2 text-xs"
                  >
                    {showAllUnder ? (
                      <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                    ) : (
                      <>Show All <ChevronDown className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
              {visibleUnderCategories.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {visibleUnderCategories.map(category => (
                    <span 
                      key={category} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
