import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for Indian market
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format number with Indian comma system (lakh/crore)
export function formatIndianNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}

// Parse currency input (remove symbols and format)
export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[₹,\s]/g, '');
  return parseFloat(cleanValue) || 0;
}