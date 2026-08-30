import React from 'react';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { isOnboarded } from '../services/onboarding';
import { useAuthStore } from '../store/auth.store';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    isOnboarded().then(setOnboarded);
  }, []);

  if (onboarded === null) return null;

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!token) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)/home" />;
}