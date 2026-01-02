import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { EmptyState, LoadingSpinner, SubjectAttendanceCard } from '../components';
import { useStudentReport } from '../hooks';

export const ReportScreen: React.FC = () => {
  const {
    handleRefresh,
    isLoading,
    isRefreshing,
    reportData,
  } = useStudentReport();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!reportData) {
    return (
      <EmptyState message="No attendance data available yet" />
    );
  }

  const getOverallColor = (percentage: number): string => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const overallColor = getOverallColor(reportData.overallPercentage);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.overallCard}>
            <Text style={styles.overallLabel}>Overall Attendance</Text>
            <Text style={[styles.overallPercentage, { color: overallColor }]}>
              {reportData.overallPercentage.toFixed(1)}%
            </Text>
            <View style={styles.overallStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{reportData.classesPresent}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{reportData.totalClasses}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {reportData.totalClasses - reportData.classesPresent}
                </Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
            </View>
            <Text style={styles.subjectsHeader}>Subject-wise Breakdown</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        data={reportData.subjectBreakdown}
        keyExtractor={(item) => item.subjectName}
        refreshControl={
          <RefreshControl
            colors={['#10b981']}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
          />
        }
        renderItem={({ item }) => (
          <SubjectAttendanceCard
            percentage={item.percentage}
            presentCount={item.classesPresent}
            subjectName={item.subjectName}
            totalCount={item.totalClasses}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  overallCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  overallPercentage: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 20,
  },
  overallStats: {
    alignItems: 'center',
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    width: '100%',
  },
  statDivider: {
    backgroundColor: '#e5e7eb',
    height: 40,
    width: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
  },
  subjectsHeader: {
    alignSelf: 'flex-start',
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
  },
});
