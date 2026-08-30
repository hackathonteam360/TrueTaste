import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CITY_KEY = 'truetaste.city';
const PREFS_KEY = 'truetaste.prefs';

export interface TastePrefs {
  city?: string;
  cuisines?: string[];
  favoriteDishes?: string[];
  spicePreference?: 'Mild' | 'Medium' | 'Spicy' | 'Very Spicy';
  budgetPreference?: '$' | '$$' | '$$$' | '$$$$';
}

interface AppState {
  city: string;
  cityLoaded: boolean;
  prefs: TastePrefs;
  loadCity: () => Promise<void>;
  setCity: (city: string) => Promise<void>;
  setPrefs: (prefs: Partial<TastePrefs>) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  city: 'Lahore',
  cityLoaded: false,
  prefs: {},

  loadCity: async () => {
    try {
      const [stored, prefJson] = await Promise.all([
        AsyncStorage.getItem(CITY_KEY),
        AsyncStorage.getItem(PREFS_KEY),
      ]);
      const next: Partial<AppState> = {};
      if (stored) next.city = stored;
      if (prefJson) {
        try {
          next.prefs = JSON.parse(prefJson);
        } catch {
          next.prefs = {};
        }
      }
      set({ ...next, cityLoaded: true });
    } catch {
      set({ cityLoaded: true });
    }
  },

  setCity: async (city) => {
    await AsyncStorage.setItem(CITY_KEY, city);
    set((s) => {
      const prefs = { ...s.prefs, city };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
      return { city, prefs };
    });
  },

  setPrefs: async (merge) => {
    set((s) => {
      const prefs = { ...s.prefs, ...merge };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs)).catch(() => {});
      return { prefs, city: prefs.city || s.city };
    });
  },
}));