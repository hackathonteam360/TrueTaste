import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { CITIES } from '../../constants/options';
import { colors, typography, radius, shadows } from '../../constants/theme';
import { useAppStore } from '../../store/app.store';

export default function CityScreen() {
  const router = useRouter();
  const setCity = useAppStore((s) => s.setCity);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');

  const filtered = CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  const select = async (city: string) => {
    await setCity(city);
    router.push('/onboarding/preferences');
  };

  const useMyLocation = async () => {
    setLocating(true);
    setLocError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission denied. Please pick a city manually.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const city = geo?.city || geo?.subregion || 'Lahore';
      const known = CITIES.find((c) => city.toLowerCase().includes(c.toLowerCase()));
      await select(known || 'Lahore');
    } catch {
      setLocError('Could not determine your city. Pick one below.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Select your city</Text>
        <Text style={styles.subtitle}>We'll show restaurants around you.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search city..."
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <TouchableOpacity style={styles.locationBtn} onPress={useMyLocation} disabled={locating}>
        {locating ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Ionicons name="locate" size={18} color={colors.primary} />
            <Text style={styles.locationLabel}>Use my location</Text>
          </>
        )}
      </TouchableOpacity>

      {locError ? <Text style={styles.error}>{locError}</Text> : null}

      <FlatList
        data={filtered}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cityCard} onPress={() => select(item)}>
            <View style={styles.cityIcon}>
              <Text style={styles.cityEmoji}>📍</Text>
            </View>
            <Text style={styles.cityName}>{item}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  back: {
    padding: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 6,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginTop: 12,
    backgroundColor: 'rgba(255,107,53,0.12)',
    borderRadius: radius.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  locationLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginHorizontal: 24,
    marginTop: 10,
  },
  list: {
    padding: 24,
    paddingTop: 18,
    gap: 12,
  },
  cityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  cityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cityEmoji: { fontSize: 18 },
  cityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});