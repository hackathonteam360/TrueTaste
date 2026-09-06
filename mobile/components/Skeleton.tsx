import React, { useEffect } from 'react';
import { Animated, View, StyleSheet, Easing, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors, useStyles, ThemeColors } from '../constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width, height = 16, radius = 8, style }: SkeletonProps) {
  const colors = useThemeColors();
  const styles = useStyles(createStyles);
  const pulse = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();1

    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

export function RestaurantCardSkeleton() {  const colors = useThemeColors();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={150} radius={16} />
      <Skeleton width="60%" height={18} style={{ marginTop: 12 }} />
      <Skeleton width="40%" height={13} style={{ marginTop: 8 }} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    paddingBottom: 16,
    overflow: 'hidden',
  },
});