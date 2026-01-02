import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

const styles = StyleSheet.create({
  absentButton: {
    backgroundColor: '#fff',
    borderColor: '#ef4444',
  },
  absentButtonActive: {
    backgroundColor: '#ef4444',
  },
  button: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#6b7280',
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
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  presentButton: {
    backgroundColor: '#fff',
    borderColor: '#10b981',
  },
  presentButtonActive: {
    backgroundColor: '#10b981',
  },
  roll: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 12,
  },
});
