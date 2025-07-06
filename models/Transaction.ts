import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  description: string;
  quantity: number;
  pricePerUnit: number;
  date: Date;
  // Virtual field for total amount
  get totalAmount(): number;
}

const TransactionSchema: Schema = new Schema({
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [0.01, 'Quantity must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Quantity must be a positive number'
    }
  },
  pricePerUnit: { 
    type: Number, 
    required: true,
    min: [0.01, 'Price per unit must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return v > 0;
      },
      message: 'Price per unit must be a positive number'
    }
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to calculate total amount
TransactionSchema.virtual('totalAmount').get(function(this: ITransaction) {
  return this.quantity * this.pricePerUnit;
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
