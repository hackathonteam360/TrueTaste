import { Response } from 'express';
import { Reward } from '../models/Reward';
import { CoinTransaction } from '../models/CoinTransaction';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';
import { redeemCoins } from '../services/coin.service';

export const listRewards = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const rewards = await Reward.find({ active: true }).lean();
  return res.json({ rewards });
});

export const redeemReward = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reward = await Reward.findById(req.params.id);
  if (!reward || !reward.active) {
    return res.status(404).json({ message: 'Reward not found' });
  }

  const result = await redeemCoins({
    userId: String(req.user._id),
    amount: reward.coinCost,
    description: reward.title,
    referenceId: String(reward._id),
  });

  return res.json({
    coupon: result.coupon,
    balance: result.balance,
    reward: {
      title: reward.title,
      coinCost: reward.coinCost,
      value: reward.value,
    },
  });
});

export const listTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactions = await CoinTransaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return res.json({ transactions });
});