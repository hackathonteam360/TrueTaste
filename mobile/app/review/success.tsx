import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Button from '../../components/Button';
import { useReviewStore } from '../../store/review.store';
import { colors, typography, radius, fonts } from '../../constants/theme';

function sentimentEmoji(sentiment?: string) {
  if (sentiment === 'positive') return '😄';
  if (sentiment === 'negative') return '😕';
  return '😐';
}

export default function ReviewSuccessScreen() {
  const { restaurantId, name, coinsEarned, balance, summary, sentiment } =
    useLocalSearchParams<{
      restaurantId: string;
      name?: string;
      coinsEarned?: string;
      balance?: string;
      summary?: string;
      sentiment?: string;
    }>();
  const router = useRouter();
  const clear = useReviewStore((s) => s.clear);

  const popIn = useRef(new Animated.Value(0)).current;
  const coins = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    clear();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.spring(popIn, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
    Animated.timing(coins, {
      toValue: 1,
      duration: 900,
      delay: 300,
      easing: Easing.out(Easing.back(1.7)),
      useNativeDriver: true,
    }).start();
  }, [popIn, coins, clear]);

  const earned = Number(coinsEarned || 0);
  const displayBalance = Number(balance || 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkCircle,
            { transform: [{ scale: popIn }], opacity: popIn },
          ]}
        >
          <Ionicons name="checkmark" size={48} color={colors.white} />
        </Animated.View>

        <Text style={styles.title}>Thanks for sharing! 🎉</Text>
        <Text style={styles.subtitle}>
          Your review at {name || 'this restaurant'} was published.
        </Text>

        {earned > 0 ? (
          <Animated.View style={[{ transform: [{ scale: coins }] }]}>
            <LinearGradient
              colors={['#FFE45C', '#FFD700', '#F5B301']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.coinBanner}
            >
              <View style={styles.coinEmojiWrap}>
                <Ionicons name="logo-usd" size={22} color={colors.dark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coinTitle}>+{earned} DineCoins earned</Text>
                <Text style={styles.coinBalance}>
                  Balance: {displayBalance.toLocaleString()} DineCoins
                </Text>
              </View>
              <View style={styles.usd}>
                <Text style={styles.usdValue}>${(displayBalance * 0.1).toFixed(2)}</Text>
                <Text style={styles.usdLabel}>value</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <View style={styles.coinBanner}>
            <Text style={styles.coinBalanceNote}>
              Balance: {displayBalance.toLocaleString()} DineCoins
            </Text>
          </View>
        )}

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBubble}>
              <Ionicons name="sparkles" size={16} color={colors.aiAccent} />
            </View>
            <Text style={styles.aiHeadline}>AI Analysis</Text>
          </View>
          <Text style={styles.aiTitle}>
            {sentimentEmoji(sentiment)}{' '}
            {sentiment === 'positive'
              ? 'Positive'
              : sentiment === 'negative'
                ? 'Negative'
                : 'Neutral'}{' '}
            sentiment detected
          </Text>
          {summary ? <Text style={styles.aiSummary}>“{summary}”</Text> : null}
        </View>

        <View style={styles.actions}>
          <Button
            title="View Rewards"
            icon={<Ionicons name="gift-outline" size={18} color={colors.white} />}
            onPress={() => router.replace('/(tabs)/rewards')}
          />
          <Button
            title="Explore Restaurants"
            variant="secondary"
            icon={<Ionicons name="home-outline" size={18} color={colors.text} />}
            style={{ marginTop: 10 }}
            onPress={() => router.replace('/(tabs)/home')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  checkCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.primary,
    borderWidth: 6,
    borderColor: '#FFE1D4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginTop: 22,
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  coinBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 16,
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  coinEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinTitle: {
    color: colors.dark,
    fontSize: 16,
    fontFamily: fonts.extrabold,
  },
  coinBalance: {
    color: 'rgba(28,27,27,0.65)',
    fontSize: 12,
    marginTop: 3,
    fontFamily: fonts.semibold,
  },
  usd: {
    alignItems: 'flex-end',
  },
  usdValue: {
    color: colors.dark,
    fontSize: 16,
    fontFamily: fonts.extrabold,
  },
  usdLabel: {
    color: 'rgba(28,27,27,0.5)',
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  coinBalanceNote: {
    color: colors.dark,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  aiCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    width: '100%',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(113, 42, 226, 0.2)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(113, 42, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeadline: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  aiTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.aiAccent,
    marginTop: 10,
  },
  aiSummary: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 19,
  },
  actions: {
    width: '100%',
    marginTop: 28,
  },
});