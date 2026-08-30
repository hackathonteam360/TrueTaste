import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { ratingColor } from '../utils/format';

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  style?: object;
}

export default function RatingStars({
  rating,
  size = 14,
  showValue = false,
  style,
}: RatingStarsProps) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    let name: keyof typeof Ionicons.glyphMap;
    if (i <= full) name = 'star';
    else if (i === full + 1 && half) name = 'star-half';
    else name = 'star-outline';
    stars.push(
      <Ionicons
        key={i}
        name={name}
        size={size}
        color={i <= full || (i === full + 1 && half) ? '#F59E0B' : '#D5D8DC'}
      />
    );
  }
  return (
    <View style={[styles.row, style]}>
      <View style={styles.row}>{stars}</View>
      {showValue ? (
        <Text style={[styles.value, { color: ratingColor(rating) }]}>
          {rating.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  value: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
  },
});