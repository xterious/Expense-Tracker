export interface Transaction {
  _id: string;
  description: string;
  quantity: number;
  pricePerUnit: number;
  date: Date;
  category: "Groceries" | "Utilities" | "Transport" | "Entertainment" | "Health" | "Other";
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyData {
  name: string;
  total: number;
}

export interface PaginatedResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// New Budget types
export interface Budget {
  _id: string;
  month: string; // "2025-01"
  category: "Groceries" | "Utilities" | "Transport" | "Entertainment" | "Health" | "Other";
  budgetAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetComparison {
  category: string;
  budget: number;
  actual: number;
  difference: number;
  percentage: number;
}

export interface SpendingInsight {
  totalBudget: number;
  totalSpent: number;
  overBudgetCategories: string[];
  underBudgetCategories: string[];
  biggestOverspend: { category: string; amount: number } | null;
  biggestUnderspend: { category: string; amount: number } | null;
}
