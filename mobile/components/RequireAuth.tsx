import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth.store';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Redirect href="/auth/login" />;
  }
  return <>{children}</>;
}