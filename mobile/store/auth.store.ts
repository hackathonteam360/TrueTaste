import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

const TOKEN_KEY = 'truetaste.jwt';
const USER_KEY = 'truetaste.user';

const isWeb = Platform.OS === 'web';

const storage = {
  getItem: (key: string) =>
    isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  deleteItem: (key: string) =>
    isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setAuth: (token: string, user: User) => Promise<void>;
  setUser: (user: User) => void;
  updateCoins: (balance: number) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);
      let user: User | null = null;
      try {
        user = userJson ? JSON.parse(userJson) : null;
      } catch {
        user = null;
      }
      set({ token, user, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  setAuth: async (token, user) => {
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },

  setUser: (user) => {
    storage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
    set({ user });
  },

  updateCoins: (balance) => {
    set((state) => {
      if (!state.user) return state;
      const user = { ...state.user, dineCoins: balance };
      storage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
      return { user };
    });
  },

  logout: async () => {
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(USER_KEY);
    set({ token: null, user: null });
  },
}));