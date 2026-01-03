import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: object;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
  },
});
