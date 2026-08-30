import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, fonts } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  emoji?: string;
  accent?: boolean;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function SectionHeader({ title, emoji, accent, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleRow}>
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {accent ? <Ionicons name="sparkles" size={17} color={colors.aiAccent} /> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emoji: { fontSize: 18 },
  title: {
    ...typography.heading,
    fontSize: 20,
    fontFamily: fonts.semibold,
  },
});