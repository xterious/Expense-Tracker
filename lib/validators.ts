import { z } from 'zod';

export const transactionSchema = z.object({
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }).max(100, {
    message: "Description must be less than 100 characters.",
  }),
  quantity: z.coerce.number().positive({
    message: "Quantity must be a positive number.",
  }).min(0.01, {
    message: "Quantity must be at least 0.01.",
  }),
  pricePerUnit: z.coerce.number().positive({
    message: "Price per unit must be a positive number.",
  }).min(0.01, {
    message: "Price per unit must be at least ₹0.01.",
  }),
  date: z.date(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
