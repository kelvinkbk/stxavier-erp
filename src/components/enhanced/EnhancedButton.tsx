// src/components/enhanced/EnhancedButton.tsx
// Modern, accessible button component with variants

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme/design-system';

interface EnhancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const getButtonStyles = () => {
    const baseStyles: any[] = [styles.button, styles[size]];

    if (fullWidth) baseStyles.push(styles.fullWidth);
    if (disabled || loading) baseStyles.push(styles.disabled);

    baseStyles.push(styles[variant]);

    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles: any[] = [styles.text, styles[`text_${size}`]];
    baseStyles.push(styles[`text_${variant}`]);

    if (disabled || loading) baseStyles.push(styles.textDisabled);

    return baseStyles;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'small'}
          color={
            variant === 'ghost' || variant === 'outline' ? colors.primary[600] : colors.text.inverse
          }
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && <React.Fragment>{icon}</React.Fragment>}
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && <React.Fragment>{icon}</React.Fragment>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Sizes
  sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 32,
    gap: spacing[1],
  },
  md: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    minHeight: 44,
    gap: spacing[2],
  },
  lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    minHeight: 52,
    gap: spacing[2],
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[600],
  },
  secondary: {
    backgroundColor: colors.gray[100],
  },
  success: {
    backgroundColor: colors.success[600],
  },
  warning: {
    backgroundColor: colors.warning[600],
  },
  error: {
    backgroundColor: colors.error[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary[600],
  },

  // States
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },

  // Text Styles
  text: {
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: typography.sizes.sm,
  },
  text_md: {
    fontSize: typography.sizes.base,
  },
  text_lg: {
    fontSize: typography.sizes.lg,
  },

  // Text Variants
  text_primary: {
    color: colors.text.inverse,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_success: {
    color: colors.text.inverse,
  },
  text_warning: {
    color: colors.text.inverse,
  },
  text_error: {
    color: colors.text.inverse,
  },
  text_ghost: {
    color: colors.primary[600],
  },
  text_outline: {
    color: colors.primary[600],
  },

  textDisabled: {
    opacity: 0.8,
  },
});

export default EnhancedButton;
