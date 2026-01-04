import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface DaySelectorProps {
  days: string[];
  onDaySelect: (index: number) => void;
  selectedIndex: number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days, onDaySelect, selectedIndex }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  dayButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 55,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    color: theme.colors.text,
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
