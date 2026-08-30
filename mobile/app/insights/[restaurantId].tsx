import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { restaurantAnalytics } from '../../services/reviews';
import { useAuthStore } from '../../store/auth.store';
import { colors, typography, radius } from '../../constants/theme';
import ProgressRing from '../../components/ProgressRing';
import AIBadge from '../../components/AIBadge';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

const CATEGORY_LABELS: { key: string; label: string; emoji: string }[] = [
  { key: 'taste', label: 'Taste', emoji: '😋' },
  { key: 'service', label: 'Service', emoji: '⚡' },
  { key: 'ambience', label: 'Ambience', emoji: '🪑' },
  { key: 'value', label: 'Value', emoji: '💸' },
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧼' },
];

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value}%</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', restaurantId],
    queryFn: () => restaurantAnalytics(restaurantId!),
    enabled: !!restaurantId && !!user,
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 14 }}>
          <Skeleton width="100%" height={160} radius={20} />
          <Skeleton width="100%" height={140} radius={20} />
          <Skeleton width="100%" height={140} radius={20} />
        </View>
      ) : isError || !data ? (
        <View style={{ padding: 16 }}>
          <ErrorState onRetry={refetch} />
        </View>
      ) : data.reviewCount === 0 ? (
        <EmptyState
          emoji="📊"
          title="No analytics yet"
          message="Analytics appear once restaurants receive their first reviews."
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.ringCard}>
            <ProgressRing
              size={132}
              strokeWidth={13}
              progress={data.averageRating / 5}
              label={data.averageRating.toFixed(1)}
              sublabel="overall"
            />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <AIBadge label="AI Analytics" />
              <Text style={styles.ringTitle}>
                Based on {data.reviewCount} review{data.reviewCount === 1 ? '' : 's'}
              </Text>
              <View style={styles.sentimentRow}>
                <View style={styles.sentimentItem}>
                  <View style={[styles.sentimentDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.sentimentText}>{data.sentiments.positive ?? 0} positive</Text>
                </View>
                <View style={styles.sentimentItem}>
                  <View style={[styles.sentimentDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.sentimentText}>{data.sentiments.neutral ?? 0} neutral</Text>
                </View>
                <View style={styles.sentimentItem}>
                  <View style={[styles.sentimentDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.sentimentText}>{data.sentiments.negative ?? 0} negative</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Category performance</Text>
            {CATEGORY_LABELS.map((c) => {
              const raw = data.categories?.[c.key] ?? 0;
              const pct = Math.round((raw / 5) * 100);
              const color =
                pct >= 75 ? colors.success : pct >= 50 ? colors.warning : colors.error;
              return (
                <Bar key={c.key} label={`${c.emoji} ${c.label}`} value={pct} color={color} />
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rating distribution</Text>
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = data.ratingDistribution?.[String(star)] ?? 0;
              return <Bar key={star} label={`${star} ★`} value={pct} color={colors.primary} />;
            })}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.subheading,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 60,
  },
  ringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ringTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 18,
  },
  sentimentRow: {
    marginTop: 12,
    gap: 6,
  },
  sentimentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  barLabel: {
    width: 108,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondaryBackground,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    width: 38,
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right',
  },
});