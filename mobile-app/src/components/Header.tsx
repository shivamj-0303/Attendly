import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onProfilePress?: () => void;
  title: string;
  userName?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onProfilePress, 
  title, 
  userName,
  showBackButton = false,
  onBackPress
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme, insets.top);

  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.header}>
      <View style={styles.content}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.title}>{title}</Text>
        {onProfilePress ? (
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <View style={styles.profileCircle}>
              <Text style={styles.profileText}>{getInitial()}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.profileButton} />
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: any, topInset: number) => StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    paddingTop: topInset,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backIcon: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
  },
  profileButton: {
    height: 40,
    width: 40,
  },
  profileCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
