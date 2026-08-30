import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { Review } from '../types';
import { colors, radius, typography } from '../constants/theme';
import { formatPriceLevel, initials, timeAgo } from '../utils/format';
import RatingStars from './RatingStars';

interface ReviewCardProps {
  review: Review;
  showRestaurant?: boolean;
}

export default function ReviewCard({ review, showRestaurant = true }: ReviewCardProps) {
  const user = typeof review.userId === 'object' ? review.userId : null;
  const restaurant =
    typeof review.restaurantId === 'object' ? (review.restaurantId as any) : null;
  const body = review.text || review.voiceTranscript;
  const avatarName = user ? user.name : 'U';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {user ? (
          <Image source={user.avatar || undefined} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initials(avatarName)}</Text>
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {showRestaurant && restaurant ? restaurant.name : user?.name || 'You'}
          </Text>
          <Text style={styles.time}>{timeAgo(review.createdAt)}</Text>
        </View>
        <RatingStars rating={review.rating} size={13} />
      </View>

      {body ? (
        <Text style={styles.bodyText} numberOfLines={4}>
          {body}
        </Text>
      ) : null}

      {review.tags?.length ? (
        <View style={styles.tags}>
          {review.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {review.sentiment ? (
        <View
          style={[
            styles.sentiment,
            {
              backgroundColor:
                review.sentiment === 'positive'
                  ? '#EAFBF1'
                  : review.sentiment === 'negative'
                    ? '#FDEDED'
                    : colors.secondaryBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.sentimentText,
              {
                color:
                  review.sentiment === 'positive'
                    ? colors.success
                    : review.sentiment === 'negative'
                      ? colors.error
                      : colors.textMuted,
              },
            ]}
          >
            {review.sentiment === 'positive'
              ? '👍 Positive'
              : review.sentiment === 'negative'
                ? '👎 Negative'
                : '😐 Neutral'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryBackground,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  bodyText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: colors.secondaryBackground,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sentiment: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '700',
  },
});