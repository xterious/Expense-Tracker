import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  description: string;
  quantity: number;
  pricePerUnit: number;
  date: Date;
  category: string;
  // Virtual field for total amount
  get totalAmount(): number;
}

const TransactionSchema = new Schema(
  {
    description: { type: String, required: true, trim: true, maxlength: 100 },
    quantity: { type: Number, required: true, min: 0.01 },
    pricePerUnit: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
    category: {
      type: String,
      required: true,
      enum: [
        "Groceries",
        "Utilities",
        "Transport",
        "Entertainment",
        "Health",
        "Other",
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to calculate total amount
TransactionSchema.virtual("totalAmount").get(function (this: ITransaction) {
  return this.quantity * this.pricePerUnit;
});

export default mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
