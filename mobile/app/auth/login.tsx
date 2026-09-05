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
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { loginApi, googleLoginApi } from '../../services/auth';
import { useAuthStore } from '../../store/auth.store';
import { colors, typography, radius, fonts } from '../../constants/theme';
import Button from '../../components/Button';
import { ApiError } from '../../services/api';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (GOOGLE_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID });
}

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginApi({ email: email.trim(), password });
      await setAuth(token, user);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    setError('');
    if (!GOOGLE_CLIENT_ID) return;
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') return;
      const idToken = response.data.idToken;
      if (!idToken) throw new Error('No Google ID token received');
      const { token, user } = await googleLoginApi(idToken);
      await setAuth(token, user);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) return;
      setError(e?.message ? `Google sign-in failed: ${e.message}` : 'Google sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🍽️</Text>
            </View>
            <Text style={styles.brandName}>TrueTaste</Text>
            <Text style={styles.brandTag}>Real experiences. Smarter recommendations.</Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>

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
              placeholder="Password"
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

          <Button title="Log in" onPress={submit} loading={loading} style={styles.submit} />

          {GOOGLE_CLIENT_ID ? (
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={googleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={styles.googleLabel}>Continue with Google</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to TrueTaste? </Text>
            <Link href="/auth/signup" style={styles.footerLink}>
              Create an account
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
  content: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  brandName: {
    fontSize: 26,
    fontFamily: fonts.extrabold,
    color: colors.text,
    marginTop: 12,
  },
  brandTag: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    marginTop: 4,
  },
  title: {
    ...typography.heading,
    marginBottom: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    height: 56,
    marginTop: 12,
  },
  googleLabel: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.semibold,
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