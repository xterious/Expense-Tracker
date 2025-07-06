export interface Transaction {
  _id: string;
  description: string;
  quantity: number;
  pricePerUnit: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  // Computed field
  totalAmount?: number;
}
