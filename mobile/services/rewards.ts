import { request } from './api';
import type { Reward, CoinTransaction } from '../types';

export function listRewards() {
  return request<{ rewards: Reward[] }>('/rewards');
}

export function redeemReward(id: string) {
  return request<{ coupon: string; balance: number; reward: Reward }>(
    `/rewards/${id}/redeem`,
    { method: 'POST' }
  );
}

export function listTransactions() {
  return request<{ transactions: CoinTransaction[] }>('/rewards/transactions');
}