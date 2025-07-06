'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecentTransactions() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/transactions/recent');
        const data = await res.json();
        if (data.success) {
          setRecentTransactions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <p className="font-medium text-sm">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category} • {format(new Date(tx.date), 'MMM dd')}
                  </p>
                </div>
                <span className="font-bold text-sm">
                  {formatCurrency(tx.quantity * tx.pricePerUnit)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No recent transactions</p>
        )}
      </CardContent>
    </Card>
  );
}
