import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createTypography, useThemeColors, useStyles, ThemeColors } from '../constants/theme';

export default function Splash() {  const colors = useThemeColors();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Text style={styles.logoEmoji}>🍽️</Text>
      </View>
      <Text style={styles.brand}>TrueTaste</Text>
      <Text style={styles.tagline}>Real experiences. Smarter recommendations.</Text>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1B1B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 42 },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    ...createTypography(colors).caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  spinner: { marginTop: 40 },
});