import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TabBarProps {
  activeTab: 'report' | 'today' | 'week';
  onTabChange: (tab: 'report' | 'today' | 'week') => void;
  showReportTab?: boolean;
}

export const ThreeTabBar: React.FC<TabBarProps> = ({
  activeTab,
  onTabChange,
  showReportTab = false,
}) => {
  return (
    <View style={styles.container}>
      <View onTouchEnd={() => onTabChange('today')} style={styles.tab}>
        <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>Today</Text>
      </View>
      <View onTouchEnd={() => onTabChange('week')} style={styles.tab}>
        <Text style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}>Week</Text>
      </View>
      {showReportTab && (
        <View onTouchEnd={() => onTabChange('report')} style={styles.tab}>
          <Text style={[styles.tabText, activeTab === 'report' && styles.tabTextActive]}>
            Report
          </Text>
        </View>
      )}
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
