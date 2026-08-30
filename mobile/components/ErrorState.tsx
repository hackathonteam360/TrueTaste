import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ message, onRetry, compact }: ErrorStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <Ionicons name="cloud-offline-outline" size={compact ? 28 : 44} color={colors.textMuted} />
      <Text style={styles.title}>Something went wrong</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <TouchableOpacity style={styles.retry} onPress={onRetry}>
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={styles.retryLabel}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  compact: { paddingVertical: 24 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.secondaryBackground,
  },
  retryLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});