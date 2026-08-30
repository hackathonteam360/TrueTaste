import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { searchByDish } from '../../services/restaurants';
import { colors, typography } from '../../constants/theme';
import RestaurantCard from '../../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';

export default function DishScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();
  const dishQuery = decodeURIComponent(query || '');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dish-search', dishQuery],
    queryFn: () => searchByDish(dishQuery),
    enabled: !!dishQuery,
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={styles.subtitle}>You searched for</Text>
          <Text style={styles.title}>{dishQuery} 🍴</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={{ padding: 16 }}>
            <RestaurantCardSkeleton />
            <RestaurantCardSkeleton />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : (data?.restaurants ?? []).length === 0 ? (
          <EmptyState
            emoji="🍽️"
            title={`No restaurants serving "${dishQuery}"`}
            message="Try another dish or search our full directory."
            actionLabel="Search again"
            onAction={() => router.push('/search')}
          />
        ) : (
          (data?.restaurants ?? []).map((r) => (
            <View key={r._id} style={{ paddingHorizontal: 16 }}>
              <RestaurantCard
                restaurant={r}
                onPress={() => router.push(`/restaurant/${r._id}`)}
              />
            </View>
          ))
        )}
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
    padding: 16,
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
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  title: {
    ...typography.heading,
    marginTop: 2,
  },
});