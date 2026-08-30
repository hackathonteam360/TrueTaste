export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const colors = {
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

export const typography = {
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
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
} as const;