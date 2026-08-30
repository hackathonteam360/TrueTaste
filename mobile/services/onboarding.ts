import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'truetaste.onboarding';

export async function isOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'done';
  } catch {
    return false;
  }
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'done');
}