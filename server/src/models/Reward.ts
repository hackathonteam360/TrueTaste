import mongoose, { Schema, model } from 'mongoose';

export interface IReward {
  title: string;
  description: string;
  type: 'delivery' | 'coupon' | 'discount';
  coinCost: number;
  value: number;
  image: string;
  active: boolean;
}

const rewardSchema = new Schema<IReward>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['delivery', 'coupon', 'discount'], default: 'coupon' },
    coinCost: { type: Number, required: true, min: 1 },
    value: { type: Number, default: 0 },
    image: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Reward = mongoose.models.Reward || model<IReward>('Reward', rewardSchema);