import mongoose, { Schema, model, Types } from 'mongoose';

export interface ICoinTransaction {
  userId: Types.ObjectId;
  type: 'earn' | 'redeem' | 'bonus';
  amount: number;
  description: string;
  referenceId: Types.ObjectId;
  createdAt: Date;
}

const coinTransactionSchema = new Schema<ICoinTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['earn', 'redeem', 'bonus'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    referenceId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

coinTransactionSchema.index({ userId: 1, createdAt: -1 });

export const CoinTransaction =
  mongoose.models.CoinTransaction || model<ICoinTransaction>('CoinTransaction', coinTransactionSchema);