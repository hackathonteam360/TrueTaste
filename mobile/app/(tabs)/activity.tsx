import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/Screen';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import ReviewCard from '../../components/ReviewCard';
import { myReviews } from '../../services/reviews';
import { listTransactions } from '../../services/rewards';
import { fetchProfile } from '../../services/user';
import { useAuthStore } from '../../store/auth.store';
import { timeAgo } from '../../utils/format';
import { colors, typography, radius } from '../../constants/theme';
import type { CoinTransaction, Review } from '../../types';

export default function ActivityScreen() {
  const user = useAuthStore((s) => s.user);

  const reviewsQ = useQuery({ queryKey: ['my-reviews'], queryFn: myReviews });
  const txQ = useQuery({ queryKey: ['transactions'], queryFn: listTransactions });
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const loading = reviewsQ.isLoading || txQ.isLoading;
  const error = reviewsQ.isError || txQ.isError;

  const reviews: Review[] = reviewsQ.data?.reviews ?? [];
  const txs: CoinTransaction[] = txQ.data?.transactions ?? [];
  // Server truth wins over the store so the balance is never stale.
  const balance = profileData?.user?.dineCoins ?? user?.dineCoins ?? 0;

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activity</Text>

      <View style={styles.coinStrip}>
        <View style={styles.coinStripIcon}>
          <Ionicons name="logo-bitcoin" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.coinStripLabel}>Total DineCoins</Text>
          <Text style={styles.coinStripValue}>{balance} DineCoins</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ gap: 12, marginTop: 20 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={100} radius={16} />
          ))}
        </View>
      ) : error ? (
        <ErrorState onRetry={() => { reviewsQ.refetch(); txQ.refetch(); }} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Coin activity</Text>
          {txs.length === 0 ? (
            <EmptyState
              emoji="🪙"
              title="No coin activity yet"
              message="Earn DineCoins by reviewing restaurants."
            />
          ) : (
            txs.map((tx) => (
              <View key={tx._id} style={styles.timelineCard}>
                <View
                  style={[
                    styles.txIcon,
                    { backgroundColor: tx.amount >= 0 ? '#EAFBF1' : '#FDEDED' },
                  ]}
                >
                  <Ionicons
                    name={tx.amount >= 0 ? 'add' : 'remove'}
                    size={16}
                    color={tx.amount >= 0 ? colors.success : colors.error}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{tx.description}</Text>
                  <Text style={styles.txTime}>{timeAgo(tx.createdAt)}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    { color: tx.amount >= 0 ? colors.success : colors.error },
                  ]}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {tx.amount}
                </Text>
              </View>
            ))
          )}

          <Text style={[styles.sectionTitle, styles.subSection]}>Recent reviews</Text>
          {reviews.length === 0 ? (
            <EmptyState
              emoji="✍️"
              title="No reviews yet"
              message="Scan a restaurant QR code and share your first experience."
            />
          ) : (
            <View style={styles.reviewsWrap}>
              {reviews.slice(0, 8).map((r) => (
                <ReviewCard key={r._id} review={r} showRestaurant />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 100 },
  title: { ...typography.title },
  coinStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coinStripIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinStripLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  coinStripValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  subSection: {
    marginTop: 32,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  txTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  reviewsWrap: {
    marginTop: 4,
  },
});