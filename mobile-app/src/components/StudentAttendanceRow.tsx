import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import { AttendanceStatus } from '../types';

export interface Student {
  attendanceStatus?: AttendanceStatus;
  email: string;
  id: number;
  name: string;
  rollNumber: string;
}

interface StudentAttendanceRowProps {
  onStatusChange: (status: AttendanceStatus) => void;
  student: Student;
}

export const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  onStatusChange,
  student,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.roll}>Roll: {student.rollNumber}</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.presentButton,
            student.attendanceStatus === 'PRESENT' && styles.presentButtonActive,
          ]}
          onPress={() => onStatusChange('PRESENT')}
        >
          <Text
            style={[
              styles.buttonText,
              student.attendanceStatus === 'PRESENT' && styles.buttonTextActive,
            ]}
          >
            Present
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.absentButton,
            student.attendanceStatus === 'ABSENT' && styles.absentButtonActive,
          ]}
          onPress={() => onStatusChange('ABSENT')}
        >
          <Text
            style={[
              styles.buttonText,
              student.attendanceStatus === 'ABSENT' && styles.buttonTextActive,
            ]}
          >
            Absent
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  absentButton: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.error,
  },
  absentButtonActive: {
    backgroundColor: theme.colors.error,
  },
  button: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonTextActive: {
    color: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  presentButton: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.primary,
  },
  presentButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  roll: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    backgroundColor: theme.mode === 'light' ? '#f9fafb' : theme.colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
});
