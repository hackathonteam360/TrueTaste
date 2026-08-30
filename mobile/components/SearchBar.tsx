import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ReturnKeyTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fonts, shadows } from '../constants/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  onMicPress?: () => void;
  onPress?: () => void;
}

export default function SearchBar({
  value = '',
  onChangeText = () => {},
  placeholder = 'Search restaurants, dishes or cuisines',
  onSubmit,
  autoFocus,
  returnKeyType = 'search',
  onMicPress,
  onPress,
}: SearchBarProps) {
  // ponytail: `onPress` mode renders a read-only surfaced bar (Explore home) that
  // routes to the real search screen — typing in a stub input was a dead end.
  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="search"
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.input} numberOfLines={1}>{placeholder}</Text>
        <View style={styles.mic}>
          <Ionicons name="mic" size={18} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : onMicPress ? (
        <TouchableOpacity style={styles.mic} onPress={onMicPress}>
          <Ionicons name="mic" size={18} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(225, 191, 181, 0.35)',
    paddingHorizontal: 16,
    height: 56,
    ...shadows.card,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  mic: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(225, 191, 181, 0.25)',
  },
});