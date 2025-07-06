'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Transaction } from '@/types';
import MonthlyExpensesChart from '@/components/MonthlyExpensesChart';
import { TransactionForm } from '@/components/TransactionForm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Use useCallback to prevent unnecessary re-renders
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache', // Prevent caching issues
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Ensure we're setting the array correctly
        setTransactions(Array.isArray(data.data) ? data.data : []);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setTransactions([]); // Reset to empty array on error
      toast.error('Error fetching transactions.', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete transaction.');
      }
      
      toast.success("Transaction deleted successfully!");
      
      // Refresh the transactions list
      await fetchTransactions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error('Error deleting transaction.', {
        description: errorMessage,
      });
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  const handleTransactionSuccess = useCallback(async () => {
    // Force refresh the transactions list
    await fetchTransactions();
    setIsDialogOpen(false);
    setEditingTransaction(null);
  }, [fetchTransactions]);

  // Format currency for Indian market
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Personal Finance Visualizer</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading chart...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && <MonthlyExpensesChart data={transactions} />}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTransaction ? 'Edit' : 'Add'} Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm
                  type={editingTransaction ? 'edit' : 'add'}
                  initialData={editingTransaction ? {
                    id: editingTransaction._id,
                    description: editingTransaction.description,
                    quantity: editingTransaction.quantity,
                    pricePerUnit: editingTransaction.pricePerUnit,
                    date: new Date(editingTransaction.date)
                  } : undefined}
                  onSuccess={handleTransactionSuccess}
                  setOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading transactions...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price/Unit</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell>{format(new Date(t.date), 'PPP')}</TableCell>
                        <TableCell className="text-right">{t.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(t.pricePerUnit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(t.quantity * t.pricePerUnit)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(t._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
