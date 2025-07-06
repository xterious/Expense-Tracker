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

import {
  Transaction,
  MonthlyData,
  PaginatedResponse,
  Budget,
  BudgetComparison,
  SpendingInsight,
} from "@/types";
import MonthlyExpensesChart from "@/components/MonthlyExpensesChart";
import CategoryBreakdownChart from "@/components/CategoryBreakdownChart";
import BudgetComparisonChart from "@/components/BudgetComparisonChart";
import BudgetForm from "@/components/BudgetForm";
import SpendingInsights from "@/components/SpendingInsights";
import RecentTransactions from "@/components/RecentTransactions";
import TransactionForm from "@/components/TransactionForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';

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
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
  const itemsPerPage = 6;
  const [chartPage, setChartPage] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const selectedMonthString = format(selectedMonth, "yyyy-MM");

  // Fetch all transactions for charts
  const fetchAllTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?limit=1000");
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

  // Fetch budgets for selected month
  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch(`/api/budgets?month=${selectedMonthString}`);
      const data = await res.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    }
  }, [selectedMonthString]);

  // Fetch paginated transactions for table
  const fetchPaginatedTransactions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?page=${page}&limit=10`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

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
        // Don't access data.error - just throw a generic error
        throw new Error("Failed to fetch transactions");
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
    fetchBudgets();
  }, [fetchAllTransactions, fetchPaginatedTransactions, fetchBudgets]);

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
      await fetchBudgets();
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
    await fetchBudgets();
    setIsDialogOpen(false);
    setEditingTransaction(null);
  }, [
    fetchAllTransactions,
    fetchPaginatedTransactions,
    fetchBudgets,
    pagination.currentPage,
  ]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  // Prepare budget comparison data
  const budgetComparison: BudgetComparison[] = budgets.map((budget) => {
    const actualSpent = allTransactions
      .filter(
        (tx) =>
          tx.category === budget.category &&
          format(tx.date, "yyyy-MM") === selectedMonthString
      )
      .reduce((sum, tx) => sum + tx.quantity * tx.pricePerUnit, 0);

    const difference = actualSpent - budget.budgetAmount;
    const percentage =
      budget.budgetAmount > 0 ? (actualSpent / budget.budgetAmount) * 100 : 0;

    return {
      category: budget.category,
      budget: budget.budgetAmount,
      actual: actualSpent,
      difference,
      percentage,
    };
  });

  // Calculate spending insights
  const spendingInsights: SpendingInsight = {
    totalBudget: budgets.reduce((sum, b) => sum + b.budgetAmount, 0),
    totalSpent: budgetComparison.reduce((sum, bc) => sum + bc.actual, 0),
    overBudgetCategories: budgetComparison
      .filter((bc) => bc.difference > 0)
      .map((bc) => bc.category),
    underBudgetCategories: budgetComparison
      .filter((bc) => bc.difference < 0)
      .map((bc) => bc.category),
    biggestOverspend: budgetComparison
      .filter((bc) => bc.difference > 0)
      .sort((a, b) => b.difference - a.difference)[0]
      ? {
          category: budgetComparison
            .filter((bc) => bc.difference > 0)
            .sort((a, b) => b.difference - a.difference)[0].category,
          amount: budgetComparison
            .filter((bc) => bc.difference > 0)
            .sort((a, b) => b.difference - a.difference)[0].difference,
        }
      : null,
    biggestUnderspend: budgetComparison
      .filter((bc) => bc.difference < 0)
      .sort((a, b) => a.difference - b.difference)[0]
      ? {
          category: budgetComparison
            .filter((bc) => bc.difference < 0)
            .sort((a, b) => a.difference - b.difference)[0].category,
          amount: Math.abs(
            budgetComparison
              .filter((bc) => bc.difference < 0)
              .sort((a, b) => a.difference - b.difference)[0].difference
          ),
        }
      : null,
  };

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

  // Get available months for selectors
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

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
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
                        disabled={
                          chartStart + itemsPerPage >= sortedMonthly.length
                        }
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
                  value={selectedMonthString}
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
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Budget Form - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <BudgetForm
                selectedMonth={selectedMonthString}
                onBudgetUpdate={fetchBudgets}
              />
            </div>

            {/* Budget Analysis Selector - Takes 1 column */}
            <Card>
              <CardHeader>
                <div className="space-y-3">
                  <CardTitle className="text-lg">Budget Analysis</CardTitle>
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor="month-select"
                      className="text-sm font-medium"
                    >
                      Select Month
                    </Label>
                    <Select
                      value={selectedMonthString}
                      onValueChange={(value) =>
                        setSelectedMonth(new Date(value + "-01"))
                      }
                    >
                      <SelectTrigger id="month-select" className="w-full">
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        budgets.reduce((sum, b) => sum + b.budgetAmount, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        budgetComparison.reduce((sum, bc) => sum + bc.actual, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Difference:</span>
                    <span
                      className={`font-medium ${
                        budgetComparison.reduce(
                          (sum, bc) => sum + bc.actual,
                          0
                        ) -
                          budgets.reduce((sum, b) => sum + b.budgetAmount, 0) >
                        0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(
                        Math.abs(
                          budgetComparison.reduce(
                            (sum, bc) => sum + bc.actual,
                            0
                          ) -
                            budgets.reduce((sum, b) => sum + b.budgetAmount, 0)
                        )
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget vs Actual Chart - Full width */}
          {budgetComparison.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle>Budget vs Actual Comparison</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {format(selectedMonth, "MMMM yyyy")}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <BudgetComparisonChart data={budgetComparison} />
              </CardContent>
            </Card>
          )}

          {/* Spending Insights - Full width */}
          {budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spending Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <SpendingInsights insights={spendingInsights} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* All Transactions Table with Pagination */}
          <Card>
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
                      {(pagination.currentPage - 1) * pagination.itemsPerPage +
                        1}{" "}
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
        </TabsContent>
      </Tabs>
    </main>
  );
}
