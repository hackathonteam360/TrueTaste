import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { resolveQr } from '../../services/reviews';
import { useReviewStore } from '../../store/review.store';
import { useAuthStore } from '../../store/auth.store';
import { colors, typography, radius } from '../../constants/theme';
import Button from '../../components/Button';
import { ApiError } from '../../services/api';

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const setContext = useReviewStore((s) => s.setContext);
  const token = useAuthStore((s) => s.token);
  const [scanned, setScanned] = useState(false);
  const [manual, setManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const skipNext = useRef(false);
  const laser = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(laser, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    sweep.start();
    return () => sweep.stop();
  }, [laser]);

  const handleCode = async (payload: string) => {
    if (skipNext.current) return;
    skipNext.current = true;
    setScanned(true);
    setLoading(true);
    setError('');
    try {
      const result = await resolveQr(payload);
      setContext(result.restaurant, result.tableNumber);
      router.replace({
        pathname: '/review',
        params: { restaurantId: result.restaurant._id, table: String(result.tableNumber) },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not find this QR code.');
      setScanned(false);
      skipNext.current = false;
    } finally {
      setLoading(false);
    }
  };

  const onBarcodeScanned = ({ data }: { data: string }) => {
    if (!scanned && !loading) handleCode(data);
  };

  const link = () => {
    Linking.openURL('truetaste://').catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan restaurant QR</Text>
      </View>

      <View style={styles.cameraWrap}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned || loading ? undefined : onBarcodeScanned}
          />
        ) : (
          <View style={[styles.cameraWrap, styles.placeholder]}>
            <Ionicons name="camera-outline" size={44} color={colors.textMuted} />
            <Text style={styles.placeholderText}>
              {permission?.status === 'denied' || permission === null
                ? 'Camera permission is needed to scan QR codes.'
                : 'Allow camera access to scan.'}
            </Text>
            <Button
              title="Grant camera permission"
              variant="secondary"
              onPress={() => requestPermission()}
              style={{ marginTop: 16, alignSelf: 'center' }}
            />
          </View>
        )}

        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <Animated.View
              style={[
                styles.laser,
                {
                  transform: [
                    {
                      translateY: laser.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 245],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.overlayHint}>Point at the QR code on your table</Text>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Finding restaurant...</Text>
            </View>
          ) : null}
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.manualWrap}>
        <Text style={styles.manualLabel}>Or enter the code manually</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.input}
            value={manual}
            onChangeText={setManual}
            placeholder="e.g. TT-6547985a2f0c3d1e2f3a4b5c-3"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.goBtn}
            onPress={() => manual.trim() && handleCode(manual.trim())}
            disabled={!manual.trim()}
          >
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>
          The seed database maps codes like TT-&#123;restaurantId&#125;-&#123;table&#125;.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.subheading,
    color: colors.white,
  },
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: radius.xl,
    backgroundColor: '#000',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1B1B1B',
  },
  placeholderText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 250,
    height: 250,
  },
  laser: {
    position: 'absolute',
    top: 0,
    left: 45,
    width: 160,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 14 },
  overlayHint: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 18,
    fontSize: 13,
    fontWeight: '600',
  },
  loading: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 12,
    fontWeight: '600',
  },
  manualWrap: {
    padding: 16,
    paddingBottom: 24,
  },
  manualLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 48,
    color: colors.white,
    fontSize: 13,
  },
  goBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    marginTop: 8,
  },
});