import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getRestaurant } from '../../services/restaurants';
import { restaurantSummary } from '../../services/reviews';
import { getFavorites, addFavorite, removeFavorite } from '../../services/user';
import { useAuthStore } from '../../store/auth.store';
import { colors, typography, radius, shadows, fonts } from '../../constants/theme';
import { formatDistance, formatPriceLevel } from '../../utils/format';
import { haversineKm } from '../../utils/geo';
import Button from '../../components/Button';
import ReviewCard from '../../components/ReviewCard';
import { Skeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurant(id!),
    enabled: !!id,
  });

  const summaryQ = useQuery({
    queryKey: ['restaurant-summary', id],
    queryFn: () => restaurantSummary(id!),
    enabled: !!id,
  });

  const favsQ = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: (isFav: boolean) =>
      isFav ? removeFavorite(id!) : addFavorite(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favorites'] });
      qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <Skeleton width="100%" height={260} radius={0} />
        <View style={{ padding: 20 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={14} style={{ marginTop: 10 }} />
          <Skeleton height={80} style={{ marginTop: 20 }} />
          <Skeleton width="100%" height={120} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.safe, { padding: 20 }]}>
        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const restaurant = data.restaurant;
  const reviews = data.reviews ?? [];
  const distance = position
    ? haversineKm(position.lat, position.lon, restaurant.latitude, restaurant.longitude)
    : undefined;

  const favIds = new Set(
    (favsQ.data?.favorites ?? []).map((f: any) => f._id ?? f)
  );
  const isFav = favIds.has(restaurant._id);

  const directions = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Could not open Google Maps'));
  };

  const toggleFav = async () => {
    setTogglingFavorite(true);
    try {
      await favoriteMutation.mutateAsync(isFav);
      Alert.alert(isFav ? 'Removed from favorites' : 'Added to favorites', restaurant.name);
    } catch {
      Alert.alert('Error', 'Could not update favorites');
    } finally {
      setTogglingFavorite(false);
    }
  };

  return (
    <View style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={restaurant.images?.[0]}
            style={styles.heroImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.38)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
            locations={[0, 0.45, 1]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroTop}>
              <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color={colors.white} />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.circleBtn} onPress={toggleFav}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFav ? colors.error : colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => router.push(`/insights/${restaurant._id}`)}
              >
                <Ionicons name="stats-chart" size={19} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} />
            <View style={styles.heroChips}>
              <View style={styles.glassChip}>
                <Text style={styles.glassChipText}>{restaurant.cuisine.join(' • ')}</Text>
              </View>
              <View style={styles.openChip}>
                <View style={styles.openDot} />
                <Text style={styles.openChipText}>{restaurant.isOpen ? 'Open now' : 'Closed'}</Text>
              </View>
            </View>
            <Text style={styles.heroName} numberOfLines={2}>
              {restaurant.name}
            </Text>
          </LinearGradient>
        </View>

        <View style={[styles.body]}>
          <View style={styles.topCard}>
            <View style={styles.infoRow}>
              <View style={styles.ratingGroup}>
                <Ionicons name="star" size={18} color={colors.warning} />
                <Text style={styles.ratingBig}>{restaurant.rating.toFixed(1)}</Text>
                <Text style={styles.metaText}>({restaurant.reviewCount} reviews)</Text>
              </View>
              <View style={styles.infoDividerV} />
              <Text style={styles.priceText}>{formatPriceLevel(restaurant.priceLevel)}</Text>
              {distance !== undefined ? (
                <>
                  <View style={styles.infoDividerV} />
                  <View style={styles.distanceGroup}>
                    <Ionicons name="location" size={15} color={colors.primary} />
                    <Text style={styles.metaText}>{formatDistance(distance)} away</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.actionRow}>
            <Button
              title="Write Review"
              icon={<Ionicons name="create-outline" size={18} color={colors.white} />}
              style={{ flex: 1 }}
              onPress={() => router.push(`/review?restaurantId=${restaurant._id}`)}
            />
            <Button
              title="Directions"
              variant="secondary"
              icon={<Ionicons name="navigate-outline" size={18} color={colors.text} />}
              style={{ flex: 1 }}
              onPress={directions}
            />
          </View>

          {summaryQ.data?.summary ? (
            <View style={styles.aiCard}>
              <LinearGradient
                colors={['#FFFFFF', '#FFFFFF', colors.aiAccentSoft]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiGlowBg}
              />
              <View style={styles.aiGlowBlob} />
              <View style={styles.aiHeader}>
                <View style={styles.aiIconBubble}>
                  <Ionicons name="sparkles" size={17} color={colors.aiAccent} />
                </View>
                <Text style={styles.aiTitle}>AI Review Summary</Text>
                <Ionicons name="sparkles" size={16} color={colors.aiAccent} />
              </View>
              <Text style={styles.aiText}>“{summaryQ.data.summary}”</Text>
              <Text style={styles.aiStats}>{summaryQ.data.reviewCount} reviews analyzed</Text>
            </View>
          ) : null}

          <View style={styles.infoCard}>
            <View style={styles.infoRowItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={restaurant.isOpen ? colors.success : colors.error}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoLabel}>Opening hours</Text>
                <Text style={[styles.infoValue, { color: restaurant.isOpen ? colors.success : colors.error }]}>
                  {restaurant.openingHours} · {restaurant.isOpen ? 'Open now' : 'Closed'}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRowItem}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{restaurant.address}</Text>
              </View>
            </View>
          </View>

          {restaurant.description ? (
            <Text style={styles.description}>{restaurant.description}</Text>
          ) : null}

          <View style={styles.actionRow}>
            <Button
              title="Write Review"
              icon={<Ionicons name="create-outline" size={18} color={colors.white} />}
              style={{ flex: 1 }}
              onPress={() => router.push(`/review?restaurantId=${restaurant._id}`)}
            />
            <Button
              title="Directions"
              variant="secondary"
              icon={<Ionicons name="navigate-outline" size={18} color={colors.text} />}
              style={{ flex: 1 }}
              onPress={directions}
            />
          </View>

          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Signature dishes</Text>
            <TouchableOpacity
              onPress={() => router.push(`/dish/${encodeURIComponent(restaurant.dishes[0]?.name || '')}`)}
            >
              <Text style={styles.menuLink}>Search dish</Text>
            </TouchableOpacity>
          </View>
          {restaurant.dishes.map((dish, i) => (
            <View key={`${dish.name}-${i}`} style={styles.dishRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dishName}>{dish.name}</Text>
                {dish.description ? (
                  <Text style={styles.dishDesc} numberOfLines={2}>
                    {dish.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.dishPrice}>Rs {dish.price.toLocaleString()}</Text>
            </View>
          ))}

          <Text style={styles.menuTitle}>Recent reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.metaText}>No reviews yet — be the first!</Text>
          ) : (
            reviews.slice(0, 5).map((r) => <ReviewCard key={r._id} review={r} />)
          )}
          {reviews.length > 5 ? (
            <TouchableOpacity
              style={styles.moreReviews}
              onPress={() => router.push(`/insights/${restaurant._id}`)}
            >
              <Text style={styles.menuLink}>View all reviews & insights</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    width: '100%',
    height: 300,
    backgroundColor: colors.secondaryBackground,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  glassChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  glassChipText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  openChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.9)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  openChipText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.semibold,
  },
  heroName: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fonts.extrabold,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  body: {
    padding: 16,
  },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginTop: -16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  ratingBig: {
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  infoDividerV: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  priceText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  distanceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(113, 42, 226, 0.2)',
    overflow: 'hidden',
    ...shadows.card,
  },
  aiGlowBg: {
    ...StyleSheet.absoluteFillObject,
  },
  aiGlowBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.aiAccentSoft,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(113, 42, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  aiText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: 10,
  },
  aiStats: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.aiAccent,
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  menuLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dishDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 12,
  },
  moreReviews: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  bottomSpace: { height: 20 },
});