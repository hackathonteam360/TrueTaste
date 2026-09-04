import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AudioModule, useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio';
import { uploadVoice } from '../../services/reviews';
import { colors, typography, radius } from '../../constants/theme';
import Button from '../../components/Button';
import { ApiError } from '../../services/api';

type Status = 'idle' | 'recording' | 'processing' | 'error';

export default function VoiceSearchScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [recReady, setRecReady] = useState<boolean | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;
  const bars = useRef([0, 1, 2, 3, 4, 5, 6, 7].map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
    (async () => {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      setRecReady(perm.status === 'granted' || perm.granted);
    })();
  }, []);

  useEffect(() => {
    if (status === 'recording') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      const loops = bars.map((b, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(b, { toValue: 0.15 + (i % 3) * 0.2, duration: 500 + i * 60, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(b, { toValue: 0.4, duration: 500 + i * 60, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        )
      );
      loop.start();
      loops.forEach((l) => l.start());
      return () => { loop.stop(); loops.forEach((l) => l.stop()); };
    }
  }, [status]);

  const startRecording = async () => {
    if (!recReady) return;
    setError('');
    try {
      await recorder.record();
      setStatus('recording');
    } catch {
      setError('Could not start recording. Check microphone permission.');
      setStatus('error');
    }
  };

  const stopRecording = async () => {
    setStatus('processing');
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError('No audio captured.');
        setStatus('error');
        return;
      }
      const result = await uploadVoice(uri, recorderState.durationMillis ?? 0);
      const q = result.transcript?.trim();
      if (!q) {
        setError('Could not understand. Try again.');
        setStatus('idle');
        return;
      }
      router.replace({ pathname: '/search', params: { q } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Voice search failed. Try again.');
      setStatus('idle');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <Text style={styles.label}>
          {status === 'recording' ? 'Listening...' : status === 'processing' ? 'Transcribing...' : 'Tap to search by voice'}
        </Text>

        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }], opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0] }) }]} />

        <View style={styles.barsRow}>
          {bars.map((b, i) => (
            <Animated.View key={i} style={[styles.bar, { transform: [{ scaleY: b }] }]} />
          ))}
        </View>

        <Button
          title={status === 'recording' ? 'Stop' : status === 'processing' ? 'Processing...' : 'Start listening'}
          loading={status === 'processing'}
          disabled={status === 'processing' || !recReady}
          onPress={status === 'recording' ? stopRecording : startRecording}
          style={{ marginTop: 32, width: 220 }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Type instead"
          variant="ghost"
          icon={<Ionicons name="search" size={16} color={colors.primary} />}
          style={{ marginTop: 14 }}
          onPress={() => router.replace('/search')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  label: { ...typography.subheading, marginBottom: 24, textAlign: 'center' },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary,
  },
  barsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40 },
  bar: { width: 5, height: 40, borderRadius: 3, backgroundColor: colors.primary },
  error: { color: colors.error, fontSize: 13, marginTop: 16, textAlign: 'center' },
});
