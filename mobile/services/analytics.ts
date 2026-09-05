import { request } from './api';
import type { FoodStats } from '../types';

export function trackEvent(type: 'search' | 'dish_view', food: string) {
  return request('/analytics/events', { method: 'POST', body: { type, food } }).catch(() => null);
}

export function getFoodStats() {
  return request<FoodStats>('/analytics/food-stats');
}