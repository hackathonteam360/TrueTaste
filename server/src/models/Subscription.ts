import mongoose, { Schema, model, Types } from 'mongoose';

export interface ISubscription {
  userId: Types.ObjectId;
  plan: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, default: 'premium' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

export const Subscription = mongoose.models.Subscription || model<ISubscription>('Subscription', subscriptionSchema);