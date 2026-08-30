import { request } from './api';
import type { Recommendation } from '../types';

export function getRecommendations(limit = 10) {
  return request<{ recommendations: Recommendation[] }>(
    `/recommendations?limit=${limit}`
  );
}