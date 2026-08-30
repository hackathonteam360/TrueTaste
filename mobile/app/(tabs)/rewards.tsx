import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/Screen';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { listRewards } from '../../services/rewards';
import { useAuthStore } from '../../store/auth.store';
import { coinsToUsd } from '../../utils/format';
import { colors, typography, radius, shadows } from '../../constants/theme';
import type { Reward } from '../../types';

export default function RewardsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: listRewards,
  });

  const rewards: Reward[] = data?.rewards ?? [];
  const balance = user?.dineCoins ?? 0;

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text style={styles.title}>Rewards</Text>

      <View style={styles.balanceCard}>
        <View style={styles.coinIcon}>
          <Ionicons name="logo-bitcoin" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.balanceLabel}>DineCoin balance</Text>
          <Text style={styles.balanceValue}>{balance.toLocaleString()} DineCoins</Text>
          <Text style={styles.balanceUsd}>≈ {coinsToUsd(balance)} in value</Text>
        </View>
        <TouchableOpacity
          style={styles.earnBtn}
          onPress={() => router.push('/qr/scanner')}
        >
          <Ionicons name="scan" size={14} color={colors.white} />
          <Text style={styles.earnBtnText}>Earn</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="information-circle-outline" size={15} color={colors.textMuted} />
        <Text style={styles.infoText}>
          Earn 10 DineCoins for every new review. 1 DineCoin = $0.10.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Redeem your coins</Text>

      {isLoading ? (
        <View style={{ gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={110} radius={16} />
          ))}
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : rewards.length === 0 ? (
        <EmptyState emoji="🎁" title="No rewards available" />
      ) : (
        <FlatList
          data={rewards}
          keyExtractor={(r) => r._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rewardCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/rewards/redeem?id=${item._id}`)}
            >
              <Image source={item.image} style={styles.rewardImage} contentFit="cover" transition={150} />
              <View style={styles.rewardBody}>
                <Text style={styles.rewardTitle}>{item.title}</Text>
                <Text style={styles.rewardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.rewardMeta}>
                  <View style={styles.costPill}>
                    <Ionicons name="logo-bitcoin" size={12} color={colors.primary} />
                    <Text style={styles.costText}>{item.coinCost}</Text>
                  </View>
                  <Text style={styles.redeemText}>Redeem ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 100 },
  title: {
    ...typography.title,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 16,
    gap: 12,
    ...shadows.card,
  },
  coinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,53,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  balanceUsd: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  earnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  earnBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    ...typography.subheading,
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardImage: {
    width: 100,
    height: 100,
  },
  rewardBody: {
    flex: 1,
    padding: 12,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  rewardDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1EA',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  costText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  redeemText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});