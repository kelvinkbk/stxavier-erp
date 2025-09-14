// src/components/enhanced/EnhancedCard.tsx
// Modern card component with variants and animations

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/design-system';

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'default',
  padding = 4,
  onPress,
  style,
  testID,
}) => {
  const cardStyles = [styles.card, styles[variant], { padding: spacing[padding] }, style];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
  },

  default: {
    ...shadows.base,
  },

  elevated: {
    ...shadows.lg,
  },

  outlined: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  flat: {
    backgroundColor: colors.surface,
  },
});

export default EnhancedCard;
