import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TabBarProps {
  activeTab: 'today' | 'week';
  onTabChange: (tab: 'today' | 'week') => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopColor: '#e5e7eb',
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
    color: '#6b7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10b981',
  },
});
