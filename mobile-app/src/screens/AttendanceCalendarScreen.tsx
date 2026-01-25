import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DayAttendance {
  date: string;
  dayOfWeek: string;
  totalClasses: number;
  classesPresent: number;
  classesAbsent: number;
  classesOnLeave: number;
  classesNotMarked: number;
  overallStatus: string;
  attendancePercentage: number;
}

interface CalendarData {
  year: number;
  month: number;
  monthName: string;
  days: DayAttendance[];
  totalClassesConducted: number;
  totalPresent: number;
  totalAbsent: number;
  totalLeave: number;
  monthlyPercentage: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function AttendanceCalendarScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedYear, selectedMonth]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/student/attendance/calendar?year=${selectedYear}&month=${selectedMonth}`
      );

      setCalendarData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PRESENT':
        return theme.colors.success;
      case 'ABSENT':
        return theme.colors.error;
      case 'LEAVE':
        return theme.colors.warning;
      case 'MIXED':
        return theme.colors.primary; // Use primary for mixed
      case 'NOT_MARKED':
        return theme.colors.border;
      case 'NO_CLASS':
        return theme.colors.background;
      default:
        return theme.colors.border;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PRESENT':
        return 'P';
      case 'ABSENT':
        return 'A';
      case 'LEAVE':
        return 'L';
      case 'MIXED':
        return 'M';
      case 'NOT_MARKED':
        return '?';
      case 'NO_CLASS':
        return '-';
      default:
        return '-';
    }
  };

  if (loading && !calendarData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCalendarData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthButton} onPress={handlePreviousMonth}>
          <Text style={styles.monthButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Text style={styles.monthText}>
            {calendarData?.monthName} {selectedYear}
          </Text>
        </View>
        <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
          <Text style={styles.monthButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly Summary */}
      {calendarData && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {Math.round(calendarData.monthlyPercentage)}%
              </Text>
              <Text style={styles.summaryLabel}>Attendance</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{calendarData.totalPresent}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{calendarData.totalAbsent}</Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{calendarData.totalLeave}</Text>
              <Text style={styles.summaryLabel}>Leave</Text>
            </View>
          </View>
        </View>
      )}

      {/* Calendar Grid */}
      <ScrollView style={styles.calendar}>
        <View style={styles.weekDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        {calendarData && (
          <View style={styles.daysGrid}>
            {/* Empty cells for days before month starts */}
            {Array.from({
              length: new Date(selectedYear, selectedMonth - 1, 1).getDay(),
            }).map((_, index) => (
              <View key={`empty-${index}`} style={styles.dayCell} />
            ))}

            {/* Actual days */}
            {calendarData.days.map((day) => {
              const date = new Date(day.date);
              const dayNumber = date.getDate();
              const isToday = new Date(day.date).toDateString() === new Date().toDateString();

              return (
                <View
                  key={day.date}
                  style={[
                    styles.dayCell,
                    { backgroundColor: getStatusColor(day.overallStatus) },
                    isToday && styles.todayCell,
                  ]}
                >
                  <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
                    {dayNumber}
                  </Text>
                  <Text style={styles.dayStatus}>
                    {getStatusLabel(day.overallStatus)}
                  </Text>
                  {day.totalClasses > 0 && (
                    <Text style={styles.dayClasses}>
                      {day.classesPresent}/{day.totalClasses}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>Present (P)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Absent (A)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.legendText}>Leave (L)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Mixed (M)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: theme.colors.border }]} />
              <Text style={styles.legendText}>Not Marked (?)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    monthButton: {
      padding: 8,
      minWidth: 40,
      alignItems: 'center',
    },
    monthButtonText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    monthDisplay: {
      flex: 1,
      alignItems: 'center',
    },
    monthText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    summary: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    calendar: {
      flex: 1,
    },
    weekDaysHeader: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    weekDayText: {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%', // 7 days in a week
      aspectRatio: 1,
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: theme.colors.border,
    },
    todayCell: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    todayNumber: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    dayStatus: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 2,
    },
    dayClasses: {
      fontSize: 10,
      color: 'white',
      marginTop: 2,
    },
    legend: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      marginTop: 16,
    },
    legendTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    legendBox: {
      width: 20,
      height: 20,
      marginRight: 6,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });
