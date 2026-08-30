import { request } from './api';
import type { Restaurant, Paginated } from '../types';

export interface RestaurantQuery {
  city?: string;
  cuisine?: string;
  rating?: number;
  price?: number;
  openNow?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

export function listRestaurants(query: RestaurantQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  return request<Paginated<Restaurant>>(`/restaurants?${params.toString()}`);
}

export function searchRestaurants(q: string) {
  return request<{ restaurants: Restaurant[] }>(
    `/restaurants/search?q=${encodeURIComponent(q)}`
  );
}

export function getRestaurant(id: string) {
  return request<{ restaurant: Restaurant; reviews: any[] }>(`/restaurants/${id}`);
}

export function searchByDish(dish: string) {
  return request<{ restaurants: Restaurant[] }>(
    `/restaurants/dish-search?dish=${encodeURIComponent(dish)}`
  );
}