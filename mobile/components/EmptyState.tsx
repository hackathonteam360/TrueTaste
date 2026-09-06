import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTypography, useThemeColors, useStyles, ThemeColors } from '../constants/theme';
import Button from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  emoji = '🍽️',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {  const colors = useThemeColors();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.btn} />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emoji: { fontSize: 44, marginBottom: 12 },
  title: { ...createTypography(colors).subheading, textAlign: 'center' },
  message: {
    ...createTypography(colors).caption,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  btn: { marginTop: 20, minWidth: 180 },
});