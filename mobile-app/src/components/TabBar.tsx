import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TabBarProps {
  activeTab: 'today' | 'week';
  onTabChange: (tab: 'today' | 'week') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.tab} onTouchEnd={() => onTabChange('today')}>
        <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
      </View>
      <View style={styles.tab} onTouchEnd={() => onTabChange('week')}>
        <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>Week</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 64,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
});
