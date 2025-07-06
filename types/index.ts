export interface Transaction {
  _id: string;
  description: string;
  quantity: number;
  pricePerUnit: number;
  date: Date;
  category:
    | "Groceries"
    | "Utilities"
    | "Transport"
    | "Entertainment"
    | "Health"
    | "Other";
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyData {
  name: string;
  total: number;
}

export interface PaginatedResponse {
  error: string;
  success: boolean;
  data: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
