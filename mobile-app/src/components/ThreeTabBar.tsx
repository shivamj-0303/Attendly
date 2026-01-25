import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface TabBarProps {
  activeTab: 'calendar' | 'today' | 'week';
  onTabChange: (tab: 'calendar' | 'today' | 'week') => void;
  showCalendarTab?: boolean;
}

export const ThreeTabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  showCalendarTab = false,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View onTouchEnd={() => onTabChange('today')} style={styles.tab}>
        <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
      </View>
      <View onTouchEnd={() => onTabChange('week')} style={styles.tab}>
        <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>Week</Text>
      </View>
      {showCalendarTab && (
        <View onTouchEnd={() => onTabChange('calendar')} style={styles.tab}>
          <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>
            Calendar
          </Text>
        </View>
      )}
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
