// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'text' | 'outline';
}

export const Button = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false, 
  style, 
  textStyle,
  variant = 'primary' 
}: ButtonProps) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.primaryButton, disabled && styles.disabledButton, style];
      case 'secondary':
        return [styles.secondaryButton, disabled && styles.disabledButton, style];
      case 'outline':
        return [styles.outlineButton, disabled && styles.disabledButton, style];
      case 'text':
        return [styles.textButton, style];
      default:
        return [styles.primaryButton, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.primaryText, textStyle];
      case 'secondary':
        return [styles.secondaryText, textStyle];
      case 'outline':
        return [styles.outlineText, textStyle];
      case 'text':
        return [styles.linkText, textStyle];
      default:
        return [styles.primaryText, textStyle];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    backgroundColor: 'transparent',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  primaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineText: {
    color: '#718096',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#1976d2',
    fontSize: 16,
  },
});
