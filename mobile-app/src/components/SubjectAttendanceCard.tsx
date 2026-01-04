import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SubjectAttendanceCardProps {
  percentage: number;
  presentCount: number;
  subjectName: string;
  totalCount: number;
}

export const SubjectAttendanceCard: React.FC<SubjectAttendanceCardProps> = ({
  percentage,
  presentCount,
  subjectName,
  totalCount,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getProgressColor = (perc: number): string => {
    if (perc >= 75) return theme.colors.primary;
    if (perc >= 60) return '#f59e0b';
    return theme.colors.error;
  };

  const progressColor = getProgressColor(percentage);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subjectName}>{subjectName}</Text>
        <Text style={[styles.percentage, { color: progressColor }]}>{percentage.toFixed(1)}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: progressColor,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Present: {presentCount} / {totalCount}
        </Text>
        <Text style={styles.footerText}>Classes: {totalCount}</Text>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBar: {
    borderRadius: 4,
    height: '100%',
  },
  progressBarContainer: {
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  subjectName: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
