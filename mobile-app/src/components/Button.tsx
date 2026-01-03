import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ onPress, text, variant = 'primary' }) => {
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

const styles = StyleSheet.create({
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
    backgroundColor: '#ef4444',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
});
