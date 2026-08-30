import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../constants/theme';

export default function AIBadge({ label = 'AI', soft }: { label?: string; soft?: boolean }) {
  if (soft) {
    return (
      <View style={[styles.badge, styles.soft]}>
        <Ionicons name="sparkles" size={11} color={colors.aiAccent} />
        <Text style={[styles.label, styles.softLabel]}>{label}</Text>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={[colors.aiAccentContainer, colors.aiAccent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Ionicons name="sparkles" size={11} color={colors.white} />
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(113, 42, 226, 0.25)',
  },
  soft: {
    backgroundColor: colors.aiAccentSoft,
    borderColor: 'rgba(113, 42, 226, 0.15)',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: colors.white,
  },
  softLabel: {
    color: colors.aiAccent,
  },
});