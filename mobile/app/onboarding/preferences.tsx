import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CUISINES,
  DISHES,
  SPICE_LEVELS,
  BUDGET_LEVELS,
} from '../../constants/options';
import { colors, typography, radius } from '../../constants/theme';
import { useAppStore } from '../../store/app.store';

export default function PreferencesScreen() {
  const router = useRouter();
  const { prefs, setPrefs } = useAppStore();
  const [cuisines, setCuisines] = useState<string[]>(prefs.cuisines || []);
  const [dishes, setDishes] = useState<string[]>(prefs.favoriteDishes || []);
  const [spice, setSpice] = useState<string>(prefs.spicePreference || 'Medium');
  const [budget, setBudget] = useState<string>(prefs.budgetPreference || '$$');

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const done = async () => {
    await setPrefs({
      cuisines,
      favoriteDishes: dishes,
      spicePreference: spice as any,
      budgetPreference: budget as any,
    });
    router.replace('/auth/signup');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What do you love?</Text>
        <Text style={styles.subtitle}>Help us pick the perfect spots for you.</Text>

        <Text style={styles.sectionLabel}>Cuisines</Text>
        <View style={styles.chipsWrap}>
          {CUISINES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, cuisines.includes(c) && styles.chipOn]}
              onPress={() => toggle(cuisines, c, setCuisines)}
            >
              <Text style={[styles.chipText, cuisines.includes(c) && styles.chipTextOn]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Favorite dishes</Text>
        <View style={styles.chipsWrap}>
          {DISHES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, dishes.includes(d) && styles.chipOn]}
              onPress={() => toggle(dishes, d, setDishes)}
            >
              <Text style={[styles.chipText, dishes.includes(d) && styles.chipTextOn]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Spice level</Text>
        <View style={styles.chipsWrap}>
          {SPICE_LEVELS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, spice === s && styles.chipOn]}
              onPress={() => setSpice(s)}
            >
              <Text style={[styles.chipText, spice === s && styles.chipTextOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Budget</Text>
        <View style={styles.chipsWrap}>
          {BUDGET_LEVELS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.chip, budget === b && styles.chipOn]}
              onPress={() => setBudget(b)}
            >
              <Text style={[styles.chipText, budget === b && styles.chipTextOn]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={done}>
          <Text style={styles.primaryLabel}>Save & continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  back: {
    padding: 20,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextOn: {
    color: colors.white,
  },
  primaryBtn: {
    marginTop: 32,
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});