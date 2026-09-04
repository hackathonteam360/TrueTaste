import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { searchRestaurants } from '../../services/restaurants';
import { colors, typography, radius } from '../../constants/theme';
import SearchBar from '../../components/SearchBar';
import RestaurantCard from '../../components/RestaurantCard';
import { RestaurantCardSkeleton } from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import type { Restaurant } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q || '');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [nonce, setNonce] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    const timer = setTimeout(async () => {
      const id = ++seq.current;
      setLoading(true);
      setError(false);
      try {
        const data = await searchRestaurants(query.trim());
        if (id !== seq.current) return;
        setResults(data.restaurants);
        setSearched(true);
      } catch {
        if (id !== seq.current) return;
        setError(true);
      } finally {
        if (id === seq.current) setLoading(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      seq.current++;
    };
  }, [query, nonce]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Chicken Karahi, Burger, Pizza..."
            autoFocus
            returnKeyType="search"
            onSubmit={() => Keyboard.dismiss()}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <RestaurantCardSkeleton />
          <RestaurantCardSkeleton />
        </View>
      ) : error ? (
        <ErrorState
          onRetry={() => setNonce((n) => n + 1)}
        />
      ) : searched && results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title={`No results for "${query}"`}
          message="Try a different dish, cuisine or restaurant name."
        />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(r) => r._id}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => {
                Keyboard.dismiss();
                router.push(`/restaurant/${item._id}`);
              }}
            />
          )}
        />
      ) : query.trim() === '' ? (
        <View style={styles.suggestions}>
          <Text style={styles.suggestTitle}>Popular searches</Text>
          {['Chicken Karahi', 'Biryani', 'Burger', 'Pizza', 'BBQ', 'Nihari'].map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.suggestion}
              onPress={() => setQuery(s)}
            >
              <Ionicons name="trending-up" size={16} color={colors.primary} />
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
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
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestions: {
    padding: 20,
  },
  suggestTitle: {
    ...typography.subheading,
    marginBottom: 12,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
});