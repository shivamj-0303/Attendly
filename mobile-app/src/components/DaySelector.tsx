import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DaySelectorProps {
  days: string[];
  onDaySelect: (index: number) => void;
  selectedIndex: number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, onDaySelect, selectedIndex }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            onPress={() => onDaySelect(index)}
            style={[styles.dayButton, index === selectedIndex && styles.dayButtonActive]}
          >
            <Text style={[styles.dayText, index === selectedIndex && styles.dayTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  dayButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 55,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dayText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  scrollView: {
    flexGrow: 0,
  },
});
