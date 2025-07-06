import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  month: string; // Format: "2025-01"
  category: string;
  budgetAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
  month: { 
    type: String, 
    required: true,
    match: /^\d{4}-\d{2}$/ // Validates YYYY-MM format
  },
  category: {
    type: String,
    required: true,
    enum: ['Groceries', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Other']
  },
  budgetAmount: { 
    type: Number, 
    required: true,
    min: [0, 'Budget amount must be positive']
  },
}, {
  timestamps: true
});

// Compound index to ensure one budget per category per month
BudgetSchema.index({ month: 1, category: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
