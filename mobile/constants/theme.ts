import { useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const lightColors = {
  primary: '#FF6B35',
  onPrimary: '#FFFFFF',
  primaryDark: '#AB3500',
  dark: '#1C1B1B',
  background: '#FAFAF8',
  secondaryBackground: '#F3F4F1',
  card: '#FFFFFF',
  surfaceLow: '#F6F3F2',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  aiAccent: '#712AE2',
  aiAccentContainer: '#8A4CFC',
  aiAccentSoft: 'rgba(124, 58, 237, 0.08)',
  dinecoinGold: '#FFD700',
  text: '#1C1B1B',
  textMuted: '#594139',
  border: '#E5E2E1',
  borderFaint: '#F3F4F1',
  outline: '#E1BFB5',
  white: '#FFFFFF',
};

export const darkColors: typeof lightColors = {
  primary: '#FF6B35',
  onPrimary: '#FFFFFF',
  primaryDark: '#FF9A66',
  dark: '#F5F5F2',
  background: '#121214',
  secondaryBackground: '#1C1C1F',
  card: '#202024',
  surfaceLow: '#2A2A2E',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  aiAccent: '#9A6CFF',
  aiAccentContainer: '#8A4CFC',
  aiAccentSoft: 'rgba(154, 108, 255, 0.14)',
  dinecoinGold: '#FFD700',
  text: '#F5F5F2',
  textMuted: '#A9A5A0',
  border: '#2E2E33',
  borderFaint: '#26262B',
  outline: '#5A4338',
  white: '#FFFFFF',
};

export const colors = lightColors;

export type ThemeColors = typeof lightColors;
export type ThemePref = 'system' | 'light' | 'dark';

const themePalettes: Record<'light' | 'dark', ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

interface ThemePrefState {
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
}

export const useThemePrefStore = create<ThemePrefState>((set) => ({
  pref: 'system',
  setPref: (pref) => {
    set({ pref });
    AsyncStorage.setItem('truetaste.theme', pref).catch(() => {});
  },
}));

export async function initThemePref(): Promise<void> {
  try {
    const v = await AsyncStorage.getItem('truetaste.theme');
    if (v === 'light' || v === 'dark' || v === 'system') {
      useThemePrefStore.setState({ pref: v });
    }
  } catch {}
}

export function activeScheme(): 'light' | 'dark' {
  const pref = useThemePrefStore.getState().pref;
  if (pref !== 'system') return pref;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function getThemeColors(): ThemeColors {
  return themePalettes[activeScheme()];
}

export function useThemeColors(): ThemeColors {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = useThemePrefStore.subscribe(() => force((x) => x + 1));
    const sub = Appearance.addChangeListener(() => force((x) => x + 1));
    return () => {
      unsub();
      sub.remove();
    };
  }, []);
  return themePalettes[activeScheme()];
}

export function useStyles<T>(factory: (c: ThemeColors) => T): T {
  const c = useThemeColors();
  return useMemo(() => factory(c), [c, factory]);
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const createTypography = (colors: ThemeColors) => ({
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontFamily: fonts.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fonts.extrabold,
    color: colors.text,
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    letterSpacing: 0.13,
    color: colors.textMuted,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
});

// Legacy module-scope tokens (light theme only) kept for non-themed callers.
export const typography = createTypography(colors);

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
} as const;