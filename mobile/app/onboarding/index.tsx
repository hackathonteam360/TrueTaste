import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors, typography } from '../../constants/theme';
import { setOnboarded } from '../../services/onboarding';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🍛',
    title: 'Discover food made for you.',
    subtitle: 'AI recommendations match your taste, cravings and reviews.',
  },
  {
    emoji: '📣',
    title: 'Share your experience.',
    subtitle: 'Rate, text or voice-review any restaurant in seconds.',
  },
  {
    emoji: '🎉',
    title: 'Review. Earn. Enjoy.',
    subtitle: 'Earn DineCoins for every review and redeem real rewards.',
  },
];

export default function OnboardingIndex() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    setActive(index);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActive(index);
  };

  const onContinue = async () => {
    if (active < SLIDES.length - 1) {
      goTo(active + 1);
    } else {
      await setOnboarded();
      router.replace('/onboarding/city');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>🍽️ TrueTaste</Text>
        <Text style={styles.brandTag}>Real experiences. Smarter recommendations.</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.slider}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={styles.slide}>
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onContinue}>
          <Text style={styles.primaryLabel}>
            {active === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skip}
          onPress={async () => {
            await setOnboarded();
            router.replace('/onboarding/city');
          }}
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  brand: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  brandTag: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 2,
  },
  slider: { flex: 1 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emojiWrap: {
    width: 140,
    height: 140,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
});