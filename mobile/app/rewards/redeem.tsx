import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listRewards, redeemReward } from '../../services/rewards';
import { useAuthStore } from '../../store/auth.store';
import { colors, typography, radius } from '../../constants/theme';
import Button from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { ApiError } from '../../services/api';
import * as Haptics from 'expo-haptics';

export default function RedeemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: listRewards,
  });

  const reward = (data?.rewards ?? []).find((r) => r._id === id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => redeemReward(id!),
    onSuccess: (result) => {
      useAuthStore.getState().updateCoins(result.balance);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setConfirmOpen(false);
      setCoupon(result.coupon);
    },
  });

  const balance = user?.dineCoins ?? 0;
  const insufficient = reward ? balance < reward.coinCost : false;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem reward</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={{ padding: 16, gap: 14 }}>
          <Skeleton width="100%" height={200} radius={20} />
          <Skeleton width="100%" height={80} radius={16} />
        </View>
      ) : isError || !reward ? (
        <View style={{ padding: 16 }}>
          <ErrorState onRetry={refetch} />
        </View>
      ) : coupon ? (
        <View style={styles.couponWrap}>
          <View style={styles.couponCard}>
            <Ionicons name="checkmark-circle" size={52} color={colors.success} />
            <Text style={styles.couponTitle}>Reward redeemed!</Text>
            <Text style={styles.couponReward}>{reward.title}</Text>
            <Text style={styles.couponLabel}>Your coupon code</Text>
            <View style={styles.couponCode}>
              <Text style={styles.couponCodeText}>{coupon}</Text>
            </View>
            <Text style={styles.couponHint}>
              Show this code at the restaurant to redeem.
            </Text>
            <Button
              title="Done"
              style={{ width: '100%', marginTop: 22 }}
              onPress={() => router.replace('/(tabs)/rewards')}
            />
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Image source={reward.image} style={styles.image} contentFit="cover" transition={150} />

          <View style={styles.balanceStrip}>
            <Ionicons name="logo-bitcoin" size={18} color={colors.primary} />
            <Text style={styles.balanceText}>
              Your balance: {balance.toLocaleString()} DineCoins
            </Text>
          </View>

          <Text style={styles.title}>{reward.title}</Text>
          <View style={styles.costPill}>
            <Ionicons name="logo-bitcoin" size={16} color={colors.primary} />
            <Text style={styles.costText}>{reward.coinCost} DineCoins</Text>
          </View>
          <Text style={styles.description}>{reward.description}</Text>

          {insufficient ? (
            <View style={styles.insufficient}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={styles.insufficientText}>
                Not enough DineCoins. Earn {reward.coinCost - balance} more by writing reviews!
              </Text>
            </View>
          ) : null}

          <Button
            title={`Redeem for ${reward.coinCost} DineCoins`}
            disabled={insufficient || mutation.isPending}
            loading={mutation.isPending}
            onPress={() => setConfirmOpen(true)}
            style={{ marginTop: 24 }}
          />
          <Button
            title="Earn more coins"
            variant="ghost"
            icon={<Ionicons name="scan" size={17} color={colors.primary} />}
            style={{ marginTop: 10 }}
            onPress={() => {
              router.replace('/qr/scanner');
            }}
          />

          <Modal
            visible={confirmOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setConfirmOpen(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Confirm redemption</Text>
                <Text style={styles.modalText}>
                  Redeem <Text style={{ fontWeight: '800' }}>{reward.title}</Text> for{' '}
                  <Text style={{ fontWeight: '800' }}>{reward.coinCost} DineCoins</Text>?
                </Text>
                <View style={styles.modalActions}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onPress={() => setConfirmOpen(false)}
                  />
                  <Button
                    title="Yes, redeem"
                    loading={mutation.isPending}
                    style={{ flex: 1 }}
                    onPress={() => mutation.mutate()}
                  />
                </View>
                {mutation.isError ? (
                  <Text style={styles.modalError}>
                    {(mutation.error as ApiError)?.message || 'Redemption failed'}
                  </Text>
                ) : null}
              </View>
            </View>
          </Modal>
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
  },
  image: {
    width: '100%',
    height: 190,
    borderRadius: radius.lg,
  },
  balanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1EA',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  costText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 21,
  },
  insufficient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF7E6',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 16,
  },
  insufficientText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
  couponWrap: {
    flex: 1,
    padding: 16,
  },
  couponCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  couponReward: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  couponLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  couponCode: {
    marginTop: 10,
    backgroundColor: colors.dark,
    borderRadius: radius.md,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  couponCodeText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
  },
  couponHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});