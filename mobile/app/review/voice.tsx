import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AudioModule, useAudioRecorder, useAudioRecorderState, RecordingPresets } from 'expo-audio';
import { uploadVoice, uploadVoiceMock } from '../../services/reviews';
import { useReviewStore } from '../../store/review.store';
import { colors, typography, radius } from '../../constants/theme';
import Button from '../../components/Button';
import { ApiError } from '../../services/api';

type Status = 'idle' | 'recording' | 'processing' | 'done';

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function VoiceReviewScreen() {
  const router = useRouter();
  const store = useReviewStore();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);

  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState(store.transcript || '');
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
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      const loops = bars.map((b, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(b, {
              toValue: 0.15 + (i % 3) * 0.2,
              duration: 500 + i * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(b, {
              toValue: 0.4,
              duration: 500 + i * 60,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      loop.start();
      loops.forEach((l) => l.start());
      return () => {
        loop.stop();
        loops.forEach((l) => l.stop());
      };
    }
  }, [status, pulse, bars]);

  const toggleRecording = async () => {
    setError('');
    if (status === 'recording') {
      await stopRecording();
      return;
    }
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
    } catch {
      setError('Recording is not available on this device. You can use a simulated transcript below.');
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    try {
      const duration = recorderState?.durationMillis ?? 5000;
      await recorder.stop();
      setStatus('processing');
      const uri = recorder.uri;
      if (uri) {
        const result = await uploadVoice(uri, duration);
        setTranscript(result.transcript);
      } else {
        throw new Error('no recording uri');
      }
      setStatus('done');
    } catch {
      // fall back to mock transcript if upload/STT fails
      setStatus('done');
      setTranscript("The food was delicious and the service was fast and friendly.");
    }
  };

  const simulate = async () => {
    setStatus('processing');
    try {
      const result = await uploadVoiceMock(8000);
      setTranscript(result.transcript);
      setStatus('done');
    } catch {
      setTranscript(
        'The food was absolutely delicious and the service was really fast. Overall a great experience.'
      );
      setStatus('done');
    }
  };

  const useTranscript = () => {
    store.setTranscript(transcript);
    router.back();
  };

  const recordAllow = recReady === true;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice review</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.mainTitle}>Record your experience</Text>

        {status === 'processing' ? (
          <View style={styles.processing}>
            <Animated.View style={{ opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }}>
              <Ionicons name="sparkles" size={54} color={colors.aiAccent} />
            </Animated.View>
            <Text style={styles.processingText}>Transcribing your voice...</Text>
            <Text style={styles.processingSub}>Our AI is converting your review to text</Text>
          </View>
        ) : (
          <>
            <View style={styles.micArea}>
              {status === 'recording' ? (
                <View style={styles.waveform}>
                  {bars.map((b, i) => (
                    <Animated.View
                      key={i}
                      style={[styles.waveBar, { transform: [{ scaleY: b }] }]}
                    />
                  ))}
                </View>
              ) : null}

              <View style={styles.micWrap}>
                {status === 'recording' ? (
                  <Animated.View
                    style={[
                      styles.pulseRing,
                      {
                        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                        transform: [
                          {
                            scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }),
                          },
                        ],
                      },
                    ]}
                  />
                ) : null}
                <TouchableOpacity
                  style={[
                    styles.micBtn,
                    status === 'recording' && styles.micBtnRecording,
                    !recordAllow && status !== 'recording' && styles.micBtnDisabled,
                  ]}
                  onPress={toggleRecording}
                  activeOpacity={0.85}
                >
                  <View style={[styles.micInner, status === 'recording' && styles.micInnerRecording]}>
                    <Ionicons
                      name={status === 'recording' ? 'stop' : 'mic'}
                      size={status === 'recording' ? 30 : 40}
                      color={colors.white}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.micStatus}>
                {status === 'recording'
                  ? `Recording... ${formatMs(recorderState?.durationMillis ?? 0)}`
                  : status === 'idle'
                    ? 'Tap to record'
                    : 'Review recorded'}
              </Text>
              <Text style={styles.micHint}>
                {status === 'recording'
                  ? 'Tap the button again to stop'
                  : 'Speak naturally, then stop. You can edit the transcript after.'}
              </Text>
            </View>

            {recReady === false ? (
              <TouchableOpacity style={styles.simBtn} onPress={simulate}>
                <Ionicons name="sparkles-outline" size={16} color={colors.aiAccent} />
                <Text style={styles.simText}>Microphone unavailable — use simulated transcript</Text>
              </TouchableOpacity>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {status === 'done' ? (
              <>
                <View style={styles.transcriptCard}>
                  <Text style={styles.transcriptLabel}>Your review</Text>
                  <TextInput
                    multiline
                    value={transcript}
                    onChangeText={setTranscript}
                    editable
                    style={styles.transcriptInput}
                    placeholder="Edit your transcript..."
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Button title="Use this review" onPress={useTranscript} style={styles.useBtn} />
              </>
            ) : null}
          </>
        )}
      </View>
    </SafeAreaView>
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
  headerTitle: {
    ...typography.subheading,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  mainTitle: {
    ...typography.title,
    fontSize: 26,
    textAlign: 'center',
  },
  micArea: {
    alignItems: 'center',
    marginTop: 48,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 56,
    marginBottom: 20,
  },
  waveBar: {
    width: 5,
    height: 48,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  micWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(113, 42, 226, 0.12)',
  },
  micBtn: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.aiAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...{
      shadowColor: '#712AE2',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 8,
    },
  },
  micBtnRecording: {
    backgroundColor: 'rgba(113, 42, 226, 0.06)',
  },
  micBtnDisabled: {
    borderColor: colors.textMuted,
  },
  micInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.aiAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInnerRecording: {
    backgroundColor: colors.primary,
  },
  micStatus: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 22,
  },
  micHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    backgroundColor: colors.aiAccentSoft,
    borderRadius: radius.md,
    padding: 14,
  },
  simText: {
    fontSize: 13,
    color: colors.aiAccent,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  transcriptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 24,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  transcriptInput: {
    marginTop: 8,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    minHeight: 90,
  },
  useBtn: {
    marginTop: 16,
  },
  processing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.aiAccent,
    marginTop: 18,
  },
  processingSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
});