import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  onProfilePress: () => void;
  title: string;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onProfilePress, title, userName }) => {
  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>{getInitial()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 74,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileButton: {
    height: 40,
    width: 40,
  },
  profileCircle: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  profileText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
});
