import { create } from 'zustand';
import type { Restaurant } from '../types';

interface ReviewState {
  restaurant: Restaurant | null;
  tableNumber: number | null;
  transcript: string | null;
  setContext: (restaurant: Restaurant | null, tableNumber?: number) => void;
  setTranscript: (transcript: string | null) => void;
  clear: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  restaurant: null,
  tableNumber: null,
  transcript: null,

  setContext: (restaurant, tableNumber) =>
    set({ restaurant, tableNumber: tableNumber ?? null }),

  setTranscript: (transcript) => set({ transcript }),

  clear: () => set({ restaurant: null, tableNumber: null, transcript: null }),
}));