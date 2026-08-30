import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { registerApi } from '../../services/auth';
import { updatePreferences } from '../../services/user';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { colors, typography, radius } from '../../constants/theme';
import Button from '../../components/Button';
import { ApiError } from '../../services/api';

export default function SignupScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const prefs = useAppStore((s) => s.prefs);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (name.trim().length < 2) {
      setError('Name is required');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await setAuth(token, user);

      // Apply taste preferences selected during onboarding.
      try {
        const { user: updated } = await updatePreferences({
          cuisines: prefs.cuisines || [],
          favoriteDishes: prefs.favoriteDishes || [],
          spicePreference: prefs.spicePreference,
          budgetPreference: prefs.budgetPreference,
          city: prefs.city,
        });
        useAuthStore.getState().setUser(updated);
      } catch {
        // prefs are best-effort at signup
      }

      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join and start earning DineCoins.</Text>

          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Ionicons
                name={showPw ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Create account" onPress={submit} loading={loading} style={styles.submit} />

          {prefs.cuisines?.length ? (
            <View style={styles.prefsHint}>
              <Ionicons name="sparkles" size={14} color={colors.aiAccent} />
              <Text style={styles.prefsHintText}>
                We'll apply your taste preferences ({prefs.cuisines.slice(0, 3).join(', ')}
                {prefs.cuisines.length > 3 ? '...' : ''}).
              </Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/auth/login" style={styles.footerLink}>
              Log in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: { flex: 1 },
  back: { padding: 20 },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 6,
    marginBottom: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
  },
  submit: {
    marginTop: 4,
  },
  prefsHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.aiAccentSoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 16,
  },
  prefsHintText: {
    flex: 1,
    fontSize: 12,
    color: colors.aiAccent,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});