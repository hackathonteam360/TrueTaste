import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import Screen from '../../components/Screen';
import SectionHeader from '../../components/SectionHeader';
import RestaurantCard from '../../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { CATEGORIES } from '../../constants/options';
import { colors, typography, radius, shadows } from '../../constants/theme';
import { useAppStore } from '../../store/app.store';
import { useAuthStore } from '../../store/auth.store';
import { getRecommendations } from '../../services/recommendations';
import { listRestaurants } from '../../services/restaurants';
import { haversineKm } from '../../utils/geo';

const CITY_CENTERS: Record<string, { lat: number; lon: number }> = {
  Lahore: { lat: 31.5204, lon: 74.3587 },
  Islamabad: { lat: 33.6844, lon: 73.0479 },
  Karachi: { lat: 24.8607, lon: 67.0011 },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export default function HomeScreen() {
  const router = useRouter();
  const city = useAppStore((s) => s.city);
  const user = useAuthStore((s) => s.user);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        }
      } catch {
        // location optional
      }
    })();
  }, []);

  const {
    data: recs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['recommendations', user?.city],
    queryFn: () => getRecommendations(10),
    enabled: !!user,
  });

  const {
    data: nearbyData,
    isLoading: nearbyLoading,
    isError: nearbyError,
    refetch: refetchNearby,
  } = useQuery({
    queryKey: ['restaurants', user?.city],
    queryFn: () => listRestaurants({ city: user?.city, limit: 50 }),
    enabled: !!user,
  });

  const nearby = useMemo(() => {
    const restaurants = nearbyData?.restaurants ?? [];
    const refPoint = position ?? CITY_CENTERS[city];
    const withDist = restaurants.map((r) => {
      if (refPoint && r.latitude && r.longitude) {
        return {
          ...r,
          distanceKm: haversineKm(refPoint.lat, refPoint.lon, r.latitude, r.longitude),
        };
      }
      return { ...r, distanceKm: undefined };
    });
    return withDist
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      .slice(0, 3);
  }, [nearbyData, position, city]);

  const withDistance = (restaurants: any[]) =>
    restaurants.map((r) => {
      const { restaurant } = r;
      if (position && restaurant.latitude && restaurant.longitude) {
        return {
          ...restaurant,
          distanceKm: haversineKm(
            position.lat,
            position.lon,
            restaurant.latitude,
            restaurant.longitude
          ),
        };
      }
      return { ...restaurant, distanceKm: undefined };
    });

  const recommendations = (recs?.recommendations ?? []).map((r) => ({
    ...r,
    restaurant: withDistance([
      { restaurant: r.restaurant, matchPercentage: r.matchPercentage },
    ])[0],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchNearby()]);
    setRefreshing(false);
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <View style={styles.locationPill}>
          <Ionicons name="location" size={15} color={colors.primary} />
          <Text style={styles.locationText}>{city}</Text>
        </View>
        <TouchableOpacity
          style={styles.qrBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/qr/scanner')}
        >
          <Ionicons name="scan" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>
        {greeting()}
        {user?.name ? ` ${user.name.split(' ')[0]}` : ''}
      </Text>
      <Text style={styles.subtitle}>What are you craving today?</Text>

      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Search restaurants, dishes or cuisines...</Text>
        <TouchableOpacity
          style={styles.micBtn}
          hitSlop={8}
          onPress={() => router.push('/search/voice')}
        >
          <Ionicons name="mic" size={17} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.label}
            style={styles.categoryTile}
            onPress={() => router.push(`/dish/${encodeURIComponent(cat.query)}`)}
          >
            <View style={styles.categoryEmojiWrap}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionHeader title="Picked for your taste" accent />
      <Text style={styles.aiSub}>AI recommendations based on your preferences</Text>

      {isLoading ? (
        <>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="No picks yet"
          message="Set your taste preferences so we can find restaurants you'll love."
          actionLabel="Set preferences"
          onAction={() => router.push('/settings')}
        />
      ) : (
        recommendations.slice(0, 6).map((rec: any, i: number) => (
          <RestaurantCard
            key={rec.restaurant._id}
            restaurant={rec.restaurant}
            showMatch
            showDistance
            featured={i === 0}
            onPress={() => router.push(`/restaurant/${rec.restaurant._id}`)}
          />
        ))
      )}

      {!!(position || CITY_CENTERS[city]) && nearby.length > 0 ? (
        <>
          <SectionHeader title="Nearby" accent style={styles.nearbyHeader} />
          <Text style={styles.aiSub}>
            {position ? 'Closest to you right now' : `Around central ${city}`}
          </Text>

          {nearbyLoading ? (
            <>
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </>
          ) : nearbyError ? (
            <ErrorState compact onRetry={refetchNearby} />
          ) : (
            nearby.map((r) => (
              <RestaurantCard
                key={r._id}
                restaurant={r}
                showDistance
                onPress={() => router.push(`/restaurant/${r._id}`)}
              />
            ))
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  qrBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    ...typography.title,
    marginTop: 16,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 4,
    fontSize: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    height: 56,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(225, 191, 181, 0.35)',
  },
  searchPlaceholder: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: colors.textMuted,
    flex: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 191, 181, 0.25)',
  },
  categories: {
    gap: 12,
    paddingVertical: 18,
  },
  categoryTile: {
    alignItems: 'center',
    gap: 6,
    width: 72,
  },
  categoryEmojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderFaint,
    ...shadows.card,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Manrope_600SemiBold',
    color: colors.text,
  },
  aiSub: {
    ...typography.caption,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0,
    marginBottom: 14,
  },
  nearbyHeader: {
    marginTop: 10,
  },
});