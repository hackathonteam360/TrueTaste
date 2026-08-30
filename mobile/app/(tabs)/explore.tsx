import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import Screen from '../../components/Screen';
import Chip from '../../components/Chip';
import SearchBar from '../../components/SearchBar';
import RestaurantCard from '../../components/RestaurantCard';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { RestaurantCardSkeleton } from '../../components/Skeleton';
import { listRestaurants } from '../../services/restaurants';
import { CUISINES } from '../../constants/options';
import { colors, typography, radius } from '../../constants/theme';
import { useAppStore } from '../../store/app.store';
import { haversineKm } from '../../utils/geo';
import type { Restaurant } from '../../types';

type ListMode = 'list' | 'map';

export default function ExploreScreen() {
  const router = useRouter();
  const city = useAppStore((s) => s.city);
  const [mode, setMode] = useState<ListMode>('list');
  const [cuisine, setCuisine] = useState('');
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);

  React.useEffect(() => {
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

  const params = useMemo(
    () => ({
      city,
      ...(cuisine ? { cuisine } : {}),
      ...(rating ? { rating } : {}),
      ...(price ? { price } : {}),
      ...(openNow ? { openNow: true } : {}),
      limit: 50,
    }),
    [city, cuisine, rating, price, openNow]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['restaurants', params],
    queryFn: () => listRestaurants(params),
  });

  const restaurants: Restaurant[] = (data?.restaurants ?? []).map((r) => {
    if (position && r.latitude && r.longitude) {
      return {
        ...r,
        distanceKm: haversineKm(position.lat, position.lon, r.latitude, r.longitude),
      };
    }
    return r;
  });

  return (
    <Screen scroll={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.toggle}>
          {(['list', 'map'] as ListMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
              onPress={() => setMode(m)}
            >
              <Ionicons
                name={m === 'list' ? 'list' : 'map-outline'}
                size={16}
                color={mode === m ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <SearchBar
        placeholder="Search restaurants, dishes..."
        onPress={() => router.push('/search')}
      />

      <View style={styles.filters}>
        <Chip
          label={cuisine || 'Cuisine'}
          onPress={cycleCuisine(cuisine, setCuisine)}
          selected={!!cuisine}
        />
        <Chip
          label={rating === 0 ? 'Rating' : `${rating}+ ⭐`}
          onPress={() => setRating(rating === 0 ? 4 : rating === 4 ? 4.5 : 0)}
          selected={rating > 0}
        />
        <Chip
          label={price === 0 ? 'Price' : '$'.repeat(price)}
          onPress={() => setPrice(price === 0 ? 1 : price === 1 ? 2 : price === 2 ? 3 : price === 3 ? 4 : 0)}
          selected={price > 0}
        />
        <Chip
          label={openNow ? 'Open now ✓' : 'Open now'}
          onPress={() => setOpenNow(!openNow)}
          selected={openNow}
        />
      </View>

      {mode === 'map' ? (
        <MapMode restaurants={restaurants} onOpenRestaurant={(id) => router.push(`/restaurant/${id}`)} />
      ) : isLoading ? (
        <View style={{ paddingTop: 8 }}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : restaurants.length === 0 ? (
        <EmptyState emoji="🔍" title="No restaurants found" message="Try removing some filters." />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => r._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              showDistance
              onPress={() => router.push(`/restaurant/${item._id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}

function cycleCuisine(
  current: string,
  setter: (v: string) => void
): () => void {
  return () => {
    if (!current) {
      setter(CUISINES[0]);
    } else {
      const idx = CUISINES.indexOf(current);
      if (idx >= CUISINES.length - 1) setter('');
      else setter(CUISINES[idx + 1]);
    }
  };
}

function MapMode({
  restaurants,
  onOpenRestaurant,
}: {
  restaurants: Restaurant[];
  onOpenRestaurant: (id: string) => void;
}) {
  const openMaps = () => {
    const r = restaurants[0];
    if (!r) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.mapWrap}>
      <View style={styles.mapCard}>
        <Ionicons name="map-outline" size={44} color={colors.primary} />
        <Text style={styles.mapTitle}>Map view</Text>
        <Text style={styles.mapHint}>
          {restaurants.length
            ? `Showing ${restaurants.length} restaurants. Tap "Get Directions" on a restaurant for live navigation via Google Maps.`
            : 'No restaurants in this view. Adjust filters.'}
        </Text>
        {restaurants.length ? (
          <TouchableOpacity style={styles.mapBtn} onPress={openMaps}>
            <Ionicons name="navigate" size={16} color={colors.white} />
            <Text style={styles.mapBtnText}>Open Google Maps</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.mapList}>
          {restaurants.slice(0, 3).map((r) => (
            <TouchableOpacity key={r._id} style={styles.mapRow} onPress={() => onOpenRestaurant(r._id)}>
              <Text style={styles.mapRowName}>{r.name}</Text>
              <Text style={styles.mapRowMeta}>
                {r.cuisine[0]} · {r.rating.toFixed(1)} ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    ...typography.title,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    padding: 4,
  },
  toggleBtn: {
    width: 42,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.card,
  },
  filters: {
    // ponytail: horizontal ScrollView rows dropped their child Text on Android new-arch,
    // so filter tags render as a wrapping row (no ScrollView) instead.
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 14,
  },
  listContent: {
    paddingTop: 4,
  },
  mapWrap: {
    flex: 1,
  },
  mapCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapTitle: {
    ...typography.subheading,
    marginTop: 12,
  },
  mapHint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 16,
  },
  mapBtnText: {
    color: colors.white,
    fontWeight: '700',
  },
  mapList: {
    width: '100%',
    marginTop: 20,
    gap: 10,
  },
  mapRow: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    padding: 12,
  },
  mapRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  mapRowMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});