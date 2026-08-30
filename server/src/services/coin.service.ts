import { User, IUser } from '../models/User';
import { CoinTransaction } from '../models/CoinTransaction';

export const REVIEW_COINS = 10;

export async function awardCoins(params: {
  userId: string;
  amount: number;
  type: 'earn' | 'bonus';
  description: string;
  referenceId?: string;
}): Promise<{ balance: number }> {
  if (params.amount <= 0) return { balance: (await User.findById(params.userId))?.dineCoins ?? 0 };

  const user = await User.findByIdAndUpdate(
    params.userId,
    { $inc: { dineCoins: params.amount } },
    { new: true }
  );
  if (!user) throw new Error('User not found');

  await CoinTransaction.create({
    userId: params.userId,
    type: params.type,
    amount: params.amount,
    description: params.description,
    referenceId: params.referenceId,
  });

  return { balance: user.dineCoins };
}

export async function redeemCoins(params: {
  userId: string;
  amount: number;
  description: string;
  referenceId?: string;
}): Promise<{ balance: number; coupon: string }> {
  const user = await User.findById(params.userId);
  if (!user) throw new Error('User not found');
  if (user.dineCoins < params.amount) {
    const err: any = new Error('Insufficient DineCoins');
    err.status = 400;
    throw err;
  }

  const updated = await User.findByIdAndUpdate(
    params.userId,
    { $inc: { dineCoins: -params.amount } },
    { new: true }
  );
  if (!updated) throw new Error('User not found');

  await CoinTransaction.create({
    userId: params.userId,
    type: 'redeem',
    amount: -params.amount,
    description: params.description,
    referenceId: params.referenceId,
  });

  return { balance: updated.dineCoins, coupon: generateCoupon() };
}

export function generateCoupon(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 5; i += 1) {
    tail += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TT-${tail}`;
}

export async function getBalance(userId: string): Promise<number> {
  const user = await User.findById(userId).select('dineCoins');
  return user?.dineCoins ?? 0;
}

export function coinsToUsd(coins: number): number {
  return coins * 0.1;
}