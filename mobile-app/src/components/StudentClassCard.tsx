import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export type AttendanceStatus = 'absent' | 'leave' | 'not_marked' | 'present';

export interface StudentClassItem {
  end: string;
  id: string;
  start: string;
  status: AttendanceStatus;
  subject: string;
  teacher: string;
}

interface StudentClassCardProps {
  item: StudentClassItem;
  onPress: () => void;
}

export const StudentClassCard: React.FC<StudentClassCardProps> = ({ item, onPress }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case 'present':
        return theme.colors.primary;
      case 'absent':
        return theme.colors.error;
      case 'leave':
        return '#f59e0b';
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.start}</Text>
        <Text style={styles.timeSub}>{item.end}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Text style={styles.teacherText}>{item.teacher}</Text>
      </View>
      <View style={styles.statusColumn}>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    elevation: 1,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
  },
  infoColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  statusColumn: {
    alignItems: 'flex-end',
    width: 100,
  },
  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  subjectText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  teacherText: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  timeSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  timeColumn: {
    width: 80,
  },
  timeText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
});
