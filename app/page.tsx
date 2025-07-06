"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Transaction, MonthlyData, PaginatedResponse } from "@/types";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryBreakdownChart from "@/components/CategoryBreakdownChart";
import RecentTransactions from "@/components/RecentTransactions";
import TransactionForm from "@/components/TransactionForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [paginatedTransactions, setPaginatedTransactions] = useState<
    Transaction[]
  >([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Chart pagination and month selection
  const itemsPerPage = 5;
  const [chartPage, setChartPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fetch all transactions for charts
  const fetchAllTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?limit=1000"); // Get all for charts
      const data = await res.json();
      if (data.success) {
        const transactions = data.data.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date),
        }));
        setAllTransactions(transactions);
      }
    } catch (err) {
      console.error("Failed to fetch all transactions:", err);
    }
  }, []);

  // Fetch paginated transactions for table
  const fetchPaginatedTransactions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?page=${page}&limit=10`);
      const data: PaginatedResponse = await res.json();
      if (data.success) {
        const transactions = data.data.map((tx: any) => ({
          ...tx,
          date: new Date(tx.date),
        }));
        setPaginatedTransactions(transactions);
        setPagination(data.pagination);
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      toast.error("Error fetching transactions.", { description: msg });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTransactions();
    fetchPaginatedTransactions(1);
  }, [fetchAllTransactions, fetchPaginatedTransactions]);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Transaction deleted!");
      await fetchAllTransactions();
      await fetchPaginatedTransactions(pagination.currentPage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error("Error deleting transaction.", { description: msg });
    }
  };

  const onDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingTransaction(null);
  };

  const onFormSuccess = useCallback(async () => {
    await fetchAllTransactions();
    await fetchPaginatedTransactions(pagination.currentPage);
    setIsDialogOpen(false);
    setEditingTransaction(null);
  }, [
    fetchAllTransactions,
    fetchPaginatedTransactions,
    pagination.currentPage,
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Prepare paginated monthly data for bar chart
  const rawMonthly = allTransactions.reduce<MonthlyData[]>((acc, tx) => {
    const month = format(tx.date, "yyyy-MM");
    const amount = tx.quantity * tx.pricePerUnit;
    const existing = acc.find((d) => d.name === month);
    if (existing) existing.total += amount;
    else acc.push({ name: month, total: amount });
    return acc;
  }, []);

  const sortedMonthly = rawMonthly.sort((a, b) => a.name.localeCompare(b.name));
  const chartStart = chartPage * itemsPerPage;
  const chartPageData = sortedMonthly.slice(
    chartStart,
    chartStart + itemsPerPage
  );

  // Get available months for pie chart selector
  const availableMonths = Array.from(
    new Set(allTransactions.map((tx) => format(tx.date, "yyyy-MM")))
  )
    .sort()
    .reverse();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Personal Finance Visualizer
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Recent Transactions */}
        <RecentTransactions />

        {/* Bar Chart */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && !error && (
              <>
                <MonthlyExpensesChart data={chartPageData} />
                <div className="flex justify-between mt-2">
                  <Button
                    size="sm"
                    disabled={chartPage === 0}
                    onClick={() => setChartPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    disabled={chartStart + itemsPerPage >= sortedMonthly.length}
                    onClick={() => setChartPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart with Month Selector */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Category Breakdown
            </CardTitle>
            <Select
              value={format(selectedMonth, "yyyy-MM")}
              onValueChange={(value) =>
                setSelectedMonth(new Date(value + "-01"))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + "-01"), "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {!loading && !error && (
              <CategoryBreakdownChart
                data={allTransactions}
                selectedMonth={selectedMonth}
                labelLine={false}
                outerRadius={80}
              />
            )}
          </CardContent>
        </Card>

        {/* All Transactions Table with Pagination */}
        <Card className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg md:text-xl">
              All Transactions
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-1 h-4 w-4" /> Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTransaction ? "Edit" : "Add"} Transaction
                  </DialogTitle>
                </DialogHeader>
                <TransactionForm
                  type={editingTransaction ? "edit" : "add"}
                  initialData={
                    editingTransaction
                      ? {
                          id: editingTransaction._id,
                          description: editingTransaction.description,
                          quantity: editingTransaction.quantity,
                          pricePerUnit: editingTransaction.pricePerUnit,
                          category: editingTransaction.category,
                          date: editingTransaction.date,
                        }
                      : undefined
                  }
                  onSuccess={onFormSuccess}
                  setOpen={setIsDialogOpen}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {loading && <p>Loading transactions...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price/Unit</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.length ? (
                      paginatedTransactions.map((t) => (
                        <TableRow key={t._id}>
                          <TableCell className="font-medium">
                            {t.description}
                          </TableCell>
                          <TableCell>{t.category}</TableCell>
                          <TableCell>
                            {format(t.date, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            {t.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(t.pricePerUnit)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(t.quantity * t.pricePerUnit)}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(t)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(t._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} transactions
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        fetchPaginatedTransactions(pagination.currentPage - 1)
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        fetchPaginatedTransactions(pagination.currentPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
