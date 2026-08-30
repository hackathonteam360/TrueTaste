import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProfile, updatePreferences, updateProfile, getFavorites } from '../services/user';
import { useAuthStore } from '../store/auth.store';
import { useAppStore } from '../store/app.store';
import {
  CUISINES,
  DISHES,
  SPICE_LEVELS,
  BUDGET_LEVELS,
  CITIES,
} from '../constants/options';
import { colors, typography, radius } from '../constants/theme';
import Button from '../components/Button';
import Chip from '../components/Chip';
import { Skeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import RestaurantCard from '../components/RestaurantCard';
import { ApiError } from '../services/api';

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, setUser, logout } = useAuthStore();
  const setAppCity = useAppStore((s) => s.setCity);

  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || 'Lahore');
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingError, setSavingError] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  const profileQ = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const favsQ = useQuery({ queryKey: ['favorites'], queryFn: getFavorites });

  const [cuisines, setCuisines] = useState<string[]>(user?.cuisines || []);
  const [dishes, setDishes] = useState<string[]>(user?.favoriteDishes || []);
  const [spice, setSpice] = useState<string>(user?.spicePreference || 'Medium');
  const [budget, setBudget] = useState<string>(user?.budgetPreference || '$$');

  const profile = profileQ.data?.user ?? user;

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const saveAll = async () => {
    setSaving(true);
    setSavingError('');
    setSavedMsg('');
    const nm = name.trim();
    try {
      const calls: Promise<{ user: any }>[] = [
        updatePreferences({
          cuisines,
          favoriteDishes: dishes,
          spicePreference: spice as any,
          budgetPreference: budget as any,
          city,
        }),
      ];
      if (nm.length >= 2) calls.push(updateProfile({ name: nm }));
      const [prefs, me] = await Promise.all(calls);
      setUser({ ...prefs.user, name: me ? me.user.name : prefs.user.name });
      await setAppCity(prefs.user.city);
      setSavedMsg('Preferences saved ✓');
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['favorites'] });
    } catch (e) {
      setSavingError(e instanceof ApiError ? e.message : 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

  const doLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.emailStatic}>{profile?.email}</Text>
          <Text style={styles.fieldLabel}>City</Text>
          <TouchableOpacity
            style={styles.cityPicker}
            onPress={() => setCityPickerOpen(true)}
          >
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.cityPickerText}>{city}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Taste preferences</Text>
        <View style={styles.card}>
          <Text style={styles.groupLabel}>Cuisines</Text>
          <View style={styles.chips}>
            {CUISINES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={cuisines.includes(c)}
                onPress={() => toggle(cuisines, c, setCuisines)}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Favorite dishes</Text>
          <View style={styles.chips}>
            {DISHES.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={dishes.includes(d)}
                onPress={() => toggle(dishes, d, setDishes)}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Spice level</Text>
          <View style={styles.chips}>
            {SPICE_LEVELS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={spice === s}
                onPress={() => setSpice(s)}
              />
            ))}
          </View>

          <Text style={styles.groupLabel}>Budget</Text>
          <View style={styles.chips}>
            {BUDGET_LEVELS.map((b) => (
              <Chip
                key={b}
                label={b}
                selected={budget === b}
                onPress={() => setBudget(b)}
              />
            ))}
          </View>

          {savingError ? <Text style={styles.error}>{savingError}</Text> : null}
          {savedMsg ? <Text style={styles.success}>{savedMsg}</Text> : null}
          <Button
            title="Save preferences"
            loading={saving}
            onPress={saveAll}
            style={{ marginTop: 16 }}
          />
        </View>

        <Text style={styles.sectionLabel}>Favorite restaurants</Text>
        {favsQ.isLoading ? (
          <Skeleton width="100%" height={160} radius={16} />
        ) : favsQ.isError ? (
          <ErrorState compact onRetry={favsQ.refetch} />
        ) : (favsQ.data?.favorites ?? []).length === 0 ? (
          <View style={styles.card}>
            <EmptyState
              emoji="🤍"
              title="No favorites yet"
              message="Tap the heart on any restaurant to save it here."
            />
          </View>
        ) : (
          (favsQ.data?.favorites ?? []).map((r: any) => (
            <RestaurantCard
              key={r._id}
              restaurant={r}
              onPress={() => router.push(`/restaurant/${r._id}`)}
            />
          ))
        )}

        <Text style={styles.sectionLabel}>Links</Text>
        <View style={styles.card}>
          <Row icon="diamond-outline" label="TrueTaste Premium" onPress={() => router.push('/subscription')} value={profile?.subscriptionStatus === 'premium' ? 'Active' : undefined} />
          <Row icon="time-outline" label="Review history" onPress={() => router.push('/(tabs)/activity')} />
          <Row icon="gift-outline" label="Rewards" onPress={() => router.push('/(tabs)/rewards')} />
          <Row icon="log-out-outline" label="Log out" onPress={doLogout} danger />
        </View>

        <Text style={styles.version}>TrueTaste v1.0.0 · Hackathon edition</Text>

        <Modal
          visible={cityPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCityPickerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Select city</Text>
              <ScrollView>
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalCity}
                    onPress={() => {
                      setCityPickerOpen(false);
                      setCity(c);
                    }}
                  >
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <Text style={styles.modalCityText}>{c}</Text>
                    {city === c ? (
                      <Ionicons name="checkmark" size={18} color={colors.success} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={19} color={danger ? colors.error : colors.primary} />
      <Text style={[styles.rowLabel, danger && { color: colors.error }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
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
  headerTitle: { ...typography.subheading },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    color: colors.text,
  },
  emailStatic: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: colors.textMuted,
    textAlignVertical: 'center',
  },
  cityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
  },
  cityPickerText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginTop: 12,
  },
  success: {
    color: colors.success,
    fontSize: 13,
    marginTop: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  version: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: 18,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  modalCity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalCityText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});