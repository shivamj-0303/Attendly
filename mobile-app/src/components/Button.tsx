import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ onPress, text, variant = 'primary' }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
        return styles.dangerButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'ghost':
        return styles.ghostButtonText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <TouchableOpacity style={[styles.button, getButtonStyle()]} onPress={onPress}>
      <Text style={[styles.baseButtonText, getTextStyle()]}>{text}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  baseButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: theme.colors.error,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.border,
  },
});
