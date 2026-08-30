import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribePremium, cancelSubscription } from '../services/user';
import { useAuthStore } from '../store/auth.store';
import { colors, typography, radius, shadows } from '../constants/theme';
import Button from '../components/Button';

const BENEFITS = [
  { icon: 'bicycle', text: 'Free delivery charges' },
  { icon: 'pricetag', text: 'Exclusive restaurant offers' },
  { icon: 'logo-bitcoin', text: 'Extra DineCoins on every review' },
  { icon: 'sparkles', text: 'Advanced AI recommendations' },
  { icon: 'stats-chart', text: 'Premium restaurant insights' },
] as const;

export default function SubscriptionScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isPremium = user?.subscriptionStatus === 'premium';

  const syncStatus = (status: 'premium' | 'none', balance?: number) => {
    const current = useAuthStore.getState().user;
    useAuthStore.getState().setUser({
      ...((current ?? user) as NonNullable<typeof user>),
      subscriptionStatus: status,
      dineCoins: balance ?? current?.dineCoins ?? 0,
    });
    qc.invalidateQueries({ queryKey: ['profile'] });
  };

  const subscribe = useMutation({
    mutationFn: subscribePremium,
    onSuccess: (data) => {
      syncStatus('premium', data.balance);
      Alert.alert('Welcome to Premium! 🎉', 'Your monthly plan is active. Demo flow only — no payment was charged.');
    },
  });

  const cancel = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      syncStatus('none');
      Alert.alert('Subscription cancelled', 'You are back to the free plan.');
    },
  });

  const onAction = () => {
    if (isPremium) {
      Alert.alert('Cancel Premium?', 'You will lose premium benefits immediately.', [
        { text: 'Keep Premium', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => cancel.mutate() },
      ]);
    } else {
      Alert.alert('Mock payment', 'This is a hackathon demo — no real payment will be processed.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe $4.99/mo', onPress: () => subscribe.mutate() },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TrueTaste Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={16} color={colors.dark} />
            <Text style={styles.heroBadgeText}>PREMIUM</Text>
          </View>
          <Text style={styles.planName}>TrueTaste Premium</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.pricePeriod}>/ month</Text>
          </View>
          <Text style={styles.heroNote}>
            Unlock the full TrueTaste experience
          </Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>All benefits included</Text>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={16} color={colors.primary} />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            </View>
          ))}
        </View>

        <Button
          title={isPremium ? 'Cancel subscription' : 'Subscribe now'}
          variant={isPremium ? 'danger' : 'primary'}
          loading={subscribe.isPending || cancel.isPending}
          onPress={onAction}
          style={{ marginTop: 24 }}
        />
        <Text style={styles.mockNote}>
          Hackathon demo · No payment processor is used.
        </Text>
      </View>
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
  heroCard: {
    backgroundColor: colors.dark,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    ...shadows.card,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.dark,
    letterSpacing: 1,
  },
  planName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  price: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  pricePeriod: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    marginBottom: 6,
    marginLeft: 4,
  },
  heroNote: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    marginTop: 12,
  },
  benefitsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  mockNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});