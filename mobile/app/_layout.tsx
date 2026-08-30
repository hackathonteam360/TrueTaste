import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useAuthStore } from '../store/auth.store';
import { useAppStore } from '../store/app.store';
import Splash from '../components/Splash';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  const loadCity = useAppStore((s) => s.loadCity);

  const [fontLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    hydrate();
    loadCity();
  }, [hydrate, loadCity]);

  if (!hydrated || !fontLoaded) {
    return <Splash />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="search/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="dish/[query]" />
        <Stack.Screen name="qr/scanner" />
        <Stack.Screen name="review/index" />
        <Stack.Screen name="review/voice" />
        <Stack.Screen name="review/success" />
        <Stack.Screen name="insights/[restaurantId]" />
        <Stack.Screen name="rewards/redeem" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="settings" />
      </Stack>
    </QueryClientProvider>
  );
}