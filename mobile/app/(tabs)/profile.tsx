import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/Screen';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { fetchProfile } from '../../services/user';
import { useAuthStore } from '../../store/auth.store';
import { initials } from '../../utils/format';
import { colors, typography, radius } from '../../constants/theme';

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function Row({ icon, label, value, onPress, danger }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={19} color={danger ? colors.error : colors.primary} />
      <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const profile = data?.user ?? user;
  const reviewCount = profile?.reviewCount ?? 0;
  const visited = profile?.restaurantsVisited ?? 0;
  const subscription = profile?.subscriptionStatus;

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <Skeleton width="100%" height={140} radius={20} style={{ marginTop: 12 }} />
      ) : isError ? (
        <ErrorState compact onRetry={refetch} />
      ) : (
        <>
          <View style={styles.userCard}>
            {profile?.avatar ? (
              <Image source={profile.avatar} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{initials(profile?.name || 'U')}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{profile?.name}</Text>
              <Text style={styles.userMeta}>{profile?.email}</Text>
              <View style={styles.userChips}>
                <Text style={styles.userChip}>📍 {profile?.city}</Text>
                {subscription === 'premium' ? (
                  <Text style={[styles.userChip, styles.premiumChip]}>⭐ Premium</Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Stat label="Reviews" value={reviewCount} />
            <View style={styles.statDivider} />
            <Stat label="Visited" value={visited} />
            <View style={styles.statDivider} />
            <Stat label="DineCoins" value={profile?.dineCoins ?? 0} />
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>Your taste</Text>
      <View style={styles.group}>
        <Row
          icon="restaurant-outline"
          label="Cuisines"
          value={(profile?.cuisines ?? []).slice(0, 3).join(', ') || 'Set preferences'}
          onPress={() => router.push('/settings')}
        />
        <Row
          icon="fast-food-outline"
          label="Favorite dishes"
          value={(profile?.favoriteDishes ?? []).slice(0, 3).join(', ') || 'Add favorites'}
          onPress={() => router.push('/settings')}
        />
        <Row
          icon="flame-outline"
          label="Spice"
          value={profile?.spicePreference || 'Medium'}
        />
        <Row icon="cash-outline" label="Budget" value={profile?.budgetPreference || '$$'} />
      </View>

      <Text style={styles.sectionLabel}>Your activity</Text>
      <View style={styles.group}>
        <Row icon="time-outline" label="Activity feed" onPress={() => router.push('/(tabs)/activity')} />
        <Row icon="gift-outline" label="Rewards" onPress={() => router.push('/(tabs)/rewards')} />
        <Row
          icon="diamond-outline"
          label="TrueTaste Premium"
          value={subscription === 'premium' ? 'Active' : undefined}
          onPress={() => router.push('/subscription')}
        />
        <Row icon="heart-outline" label="Favorite restaurants" onPress={() => router.push('/settings')} />
      </View>

      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.group}>
        <Row icon="log-out-outline" label="Log out" danger onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.title },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  userMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  userChips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  userChip: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    overflow: 'hidden',
  },
  premiumChip: {
    backgroundColor: colors.dark,
    color: colors.warning,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textMuted,
    maxWidth: 140,
  },
});