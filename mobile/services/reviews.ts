import { request } from './api';
import type { Review, QrResult, AIAnalysis, RestaurantAnalytics } from '../types';

export function resolveQr(code: string) {
  return request<QrResult>(`/qr/${encodeURIComponent(code)}`);
}

export async function uploadVoice(audioUri: string, durationMs: number) {
  const form = new FormData();
  const name = audioUri.split('/').pop() || 'review.m4a';
  form.append('audio', {
    uri: audioUri,
    name,
    type: 'audio/m4a',
  } as any);
  form.append('durationMs', String(durationMs));
  return request<{ transcript: string }>('/reviews/voice', {
    method: 'POST',
    formData: form,
  });
}

export async function uploadVoiceMock(durationMs: number) {
  const form = new FormData();
  form.append('durationMs', String(durationMs));
  return request<{ transcript: string }>('/reviews/voice', {
    method: 'POST',
    formData: form,
  });
}

export interface CreateReviewInput {
  restaurantId: string;
  rating: number;
  text?: string;
  voiceTranscript?: string;
  categoryRatings?: Record<string, number>;
  tags?: string[];
}

export function createReview(data: CreateReviewInput) {
  return request<{
    review: Review;
    ai: AIAnalysis;
    coinsEarned: number;
    dineCoinBalance: number;
  }>('/reviews', { method: 'POST', body: data });
}

export function myReviews() {
  return request<{ reviews: Review[] }>('/reviews/my');
}

export function restaurantSummary(restaurantId: string) {
  return request<{
    reviewCount: number;
    averageRating: number;
    sentiments: Record<string, number>;
    summary: string;
  }>(`/reviews/restaurant/${restaurantId}/summary`);
}

export function restaurantAnalytics(restaurantId: string) {
  return request<RestaurantAnalytics>(`/reviews/restaurant/${restaurantId}/analytics`);
}