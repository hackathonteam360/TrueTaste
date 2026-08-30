import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { Restaurant } from '../types';
import { colors, radius, shadows, typography, fonts } from '../constants/theme';
import { formatDistance, formatPriceLevel } from '../utils/format';
import RatingStars from './RatingStars';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  showMatch?: boolean;
  showDistance?: boolean;
  featured?: boolean;
}

export default function RestaurantCard({
  restaurant,
  onPress,
  showMatch = false,
  showDistance = false,
  featured = false,
}: RestaurantCardProps) {
  const image = restaurant.images?.[0];
  const match = restaurant.matchPercentage ?? 0;

  if (featured) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.card, styles.featuredCard]}>
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF', colors.aiAccentSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGlow}
        />
        <View>
          <Image source={image} style={styles.featuredImage} contentFit="cover" transition={200} />
          {showMatch && match > 0 ? (
            <LinearGradient
              colors={[colors.aiAccentContainer, colors.aiAccent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredMatch}
            >
              <Ionicons name="sparkles" size={12} color={colors.white} />
              <Text style={styles.matchText}>{match}% match</Text>
            </LinearGradient>
          ) : null}
          <View style={styles.featuredFav}>
            <Ionicons name="heart-outline" size={18} color={colors.text} />
          </View>
        </View>
        <View style={styles.featuredBody}>
          <View style={styles.featuredTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredName} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <Text style={styles.featuredCuisine} numberOfLines={1}>
                {restaurant.cuisine.join(' • ')}
              </Text>
            </View>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={15} color={colors.warning} />
              <Text style={styles.ratingChipText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.featuredMeta}>
            {showDistance && restaurant.distanceKm !== undefined ? (
              <View style={styles.featuredMetaItem}>
                <Ionicons name="location" size={15} color={colors.textMuted} />
                <Text style={styles.featuredMetaText}>{formatDistance(restaurant.distanceKm)}</Text>
              </View>
            ) : null}
            <View style={styles.featuredMetaItem}>
              <Ionicons
                name={restaurant.isOpen ? 'time' : 'time-outline'}
                size={15}
                color={colors.textMuted}
              />
              <Text style={styles.featuredMetaText}>
                {restaurant.isOpen ? 'Open now' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View>
        <Image source={image} style={styles.image} contentFit="cover" transition={200} />
        {showMatch && match > 0 ? (
          <LinearGradient
            colors={[colors.aiAccentContainer, colors.aiAccent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.matchBadge}
          >
            <Ionicons name="sparkles" size={11} color={colors.white} />
            <Text style={styles.matchText}>{match}% match</Text>
          </LinearGradient>
        ) : null}
        <View style={styles.openBadge}>
          <Text
            style={[
              styles.openText,
              { color: restaurant.isOpen ? colors.success : colors.error },
            ]}
          >
            {restaurant.isOpen ? 'Open now' : 'Closed'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {restaurant.cuisine.join(' · ')} {restaurant.matchedDishes?.length ? `· ${restaurant.matchedDishes[0]}` : ''}
        </Text>
        {restaurant.matchReasons?.length ? (
          <View style={styles.reasons}>
            {restaurant.matchReasons!.slice(0, 2).map((reason) => (
              <View key={reason} style={styles.reason}>
                <Ionicons name="sparkles" size={10} color={colors.aiAccent} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <RatingStars rating={restaurant.rating} size={13} />
          <Text style={styles.metaText}>({restaurant.reviewCount})</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{formatPriceLevel(restaurant.priceLevel)}</Text>
          {showDistance && restaurant.distanceKm !== undefined ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.metaText}>{formatDistance(restaurant.distanceKm)}</Text>
            </>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: colors.secondaryBackground,
  },
  featuredCard: {
    borderRadius: radius.xl,
    borderColor: colors.borderFaint,
  },
  featuredGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.secondaryBackground,
  },
  featuredMatch: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featuredFav: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  featuredBody: {
    padding: 16,
  },
  featuredTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featuredName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  featuredCuisine: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceLow,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 10,
  },
  ratingChipText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  matchText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.semibold,
  },
  openBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(28,27,27,0.72)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  openText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fonts.semibold,
  },
  body: {
    padding: 14,
  },
  name: {
    ...typography.subheading,
    fontSize: 17,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.aiAccentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reasonText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: colors.aiAccent,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
  dot: {
    color: colors.textMuted,
  },
});