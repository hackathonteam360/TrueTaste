import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { getRestaurant } from '../../services/restaurants';
import { createReview, myReviews } from '../../services/reviews';
import { useAuthStore } from '../../store/auth.store';
import { useReviewStore } from '../../store/review.store';
import { REVIEW_TAGS } from '../../constants/options';
import { colors, radius, fonts } from '../../constants/theme';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { Skeleton } from '../../components/Skeleton';
import { ApiError } from '../../services/api';

const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'taste', label: 'Taste', emoji: '😋' },
  { key: 'service', label: 'Service', emoji: '⚡' },
  { key: 'ambience', label: 'Ambience', emoji: '🪑' },
  { key: 'value', label: 'Value', emoji: '💸' },
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧼' },
];

const ANALYSIS_STEPS = [
  'Analyzing your review...',
  'Finding key insights...',
  'Generating your summary...',
];

export default function ReviewScreen() {
  const { restaurantId, table } = useLocalSearchParams<{
    restaurantId: string;
    table?: string;
  }>();
const router = useRouter();
const store = useReviewStore();
const user = useAuthStore((s) => s.user);
const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');

  const transcript = store.transcript;

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });

  const { data: myData } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: myReviews,
    enabled: !!restaurantId,
  });

  // One-time coin reward per restaurant — surface that here instead of surprising on the success screen.
  const alreadyReviewed = !!restaurantId &&
    (myData?.reviews ?? []).some((r) =>
      (typeof r.restaurantId === 'string' ? r.restaurantId : r.restaurantId?._id) === restaurantId
    );

  useEffect(() => {
    if (!store.restaurant && data?.restaurant) {
      store.setContext(data.restaurant, table ? Number(table) : undefined);
    }
  }, [data, store, table]);

  const toggleTag = (tag: string) =>
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));

  const setCategory = (key: string, value: number) =>
    setCategories((c) => ({ ...c, [key]: value }));

  const submit = async () => {
    setError('');
    if (rating === 0) {
      setError('Please give a star rating');
      return;
    }
    if (!text.trim() && !transcript?.trim()) {
      setError('Add a text review or a voice review');
      return;
    }
    setSubmitting(true);
    setStage(0);
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, 1300);

    try {
      const result = await createReview({
        restaurantId: restaurantId!,
        rating,
        text: text.trim(),
        voiceTranscript: transcript?.trim(),
        categoryRatings: categories,
        tags,
      });
      useAuthStore.getState().updateCoins(result.dineCoinBalance);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      store.setTranscript(null);
      clearInterval(interval);
      router.replace({
        pathname: '/review/success',
        params: {
          restaurantId,
          name: store.restaurant?.name || data?.restaurant?.name || '',
          coinsEarned: String(result.coinsEarned),
          balance: String(result.dineCoinBalance),
          summary: result.ai.summary,
          sentiment: result.ai.sentiment,
        },
      });
    } catch (e) {
      clearInterval(interval);
      setSubmitting(false);
      setError(e instanceof ApiError ? e.message : 'Could not submit your review. Try again.');
    }
  };

  const restaurant = store.restaurant || data?.restaurant;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.introTitle}>How was your experience?</Text>
          <Text style={styles.introSub}>
            Tell others what to expect — your review helps locals discover hidden gems.
          </Text>
        </View>

        {isLoading ? (
          <Skeleton width="100%" height={80} radius={16} />
        ) : restaurant ? (
          <View style={styles.restaurantCard}>
            <Image source={restaurant.images?.[0]} style={styles.restaurantImage} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantMeta}>
                {restaurant.cuisine.join(' · ')}
                {table ? ` · Table ${table}` : ''}
              </Text>
            </View>
          </View>
        ) : null}

        {submitting ? (
          <View style={styles.analyzing}>
            <View style={styles.sparkles}>
              {[0, 1, 2].map((i) => (
                <Ionicons
                  key={i}
                  name="sparkles"
                  size={18 + i * 10}
                  color={i === stage % 3 ? colors.aiAccent : colors.aiAccentSoft}
                />
              ))}
            </View>
            <Text style={styles.analyzingText}>{ANALYSIS_STEPS[stage]}</Text>
            <Text style={styles.analyzingSub}>Our AI is reading your experience...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Your rating</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setRating(i);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }}
                  >
                    <Ionicons
                      name={i <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={i <= rating ? colors.warning : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>
                {rating === 0
                  ? 'Tap to rate'
                  : rating <= 2
                    ? 'Not great'
                    : rating === 3
                      ? 'It was okay'
                      : rating === 4
                        ? 'Pretty good!'
                        : 'Amazing! 😍'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>How was each category?</Text>
              {CATEGORIES.map((c) => (
                <View key={c.key} style={styles.categoryRow}>
                  <Text style={styles.categoryLabel}>
                    {c.emoji} {c.label}
                  </Text>
                  <View style={styles.dotsRow}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              i <= (categories[c.key] ?? 0) ? colors.primary : colors.secondaryBackground,
                            borderColor:
                              i <= (categories[c.key] ?? 0) ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setCategory(c.key, i)}
                      >
                        <Text
                          style={[
                            styles.dotText,
                            {
                              color: i <= (categories[c.key] ?? 0) ? colors.white : colors.textMuted,
                            },
                          ]}
                        >
                          {i}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Your review</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={5}
                value={text}
                onChangeText={setText}
                placeholder="How was the food and service? Tell others what to expect..."
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                style={styles.voiceBtn}
                onPress={() =>
                  router.push({ pathname: '/review/voice', params: { restaurantId } })
                }
              >
                <View style={styles.voiceIcon}>
                  <Ionicons name="mic" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.voiceTitle}>
                    {transcript ? 'Edit voice review' : 'Add a voice review'}
                  </Text>
                  <Text style={styles.voiceSub}>
                    {transcript
                      ? '✓ Voice transcript added — tap to edit'
                      : 'Record your experience in seconds'}
                  </Text>
                </View>
                {transcript ? (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {transcript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>Voice transcript</Text>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
) : null}

        {alreadyReviewed && (
          <View style={styles.alreadyNotice}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={styles.alreadyNoticeText}>
              You've already earned DineCoins at this restaurant — this review won't add more.
            </Text>
          </View>
        )}

            <View style={styles.section}>
              <Text style={styles.label}>Add tags</Text>
              <View style={styles.tagsWrap}>
                {REVIEW_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    selected={tags.includes(tag)}
                    onPress={() => toggleTag(tag)}
                  />
                ))}
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={
            rating > 0 && (text.trim() || transcript)
              ? 'Submit review · +10 DineCoins'
              : 'Submit review'
          }
          loading={submitting}
          onPress={submit}
        />
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
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  intro: {
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 28,
    fontFamily: fonts.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  introSub: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alreadyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.aiAccentSoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 12,
  },
  alreadyNoticeText: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 14,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  restaurantMeta: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 3,
  },
  analyzing: {
    alignItems: 'center',
    paddingVertical: 80,
    backgroundColor: colors.aiAccentSoft,
    borderRadius: radius.xl,
    marginTop: 16,
  },
  sparkles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  analyzingText: {
    fontSize: 17,
    fontFamily: fonts.extrabold,
    color: colors.aiAccent,
  },
  analyzingSub: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 8,
  },
  section: {
    marginTop: 22,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.textMuted,
    marginTop: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    width: 130,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dotText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.lg,
    padding: 14,
    minHeight: 140,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlignVertical: 'top',
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    marginTop: 12,
  },
  voiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  voiceSub: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  transcriptBox: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 12,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  transcriptText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 6,
    lineHeight: 19,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
});