import { request } from './api';
import type { Restaurant, User, Subscription } from '../types';

export function fetchProfile() {
  return request<{ user: User }>('/users/me');
}

export function updateProfile(data: { name?: string; avatar?: string; city?: string }) {
  return request<{ user: User }>('/users/me', { method: 'PATCH', body: data });
}

export function updatePreferences(data: {
  cuisines?: string[];
  favoriteDishes?: string[];
  spicePreference?: string;
  budgetPreference?: string;
  city?: string;
}) {
  return request<{ user: User }>('/users/preferences', { method: 'PATCH', body: data });
}

export function getFavorites() {
  return request<{ favorites: Restaurant[] }>('/users/favorites');
}

export function addFavorite(restaurantId: string) {
  return request<{ favorites: Restaurant[] }>(`/users/favorites/${restaurantId}`, {
    method: 'POST',
  });
}

export function removeFavorite(restaurantId: string) {
  return request<{ favorites: Restaurant[] }>(`/users/favorites/${restaurantId}`, {
    method: 'DELETE',
  });
}

export function subscribePremium() {
  return request<{ subscription: Subscription; bonusCoins: number; balance: number }>(
    '/users/subscription',
    { method: 'POST' }
  );
}

export function cancelSubscription() {
  return request<{ message: string }>('/users/subscription', { method: 'DELETE' });
}