import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { getStudentAttendanceReport } from '../services/api';
import type { AttendanceReport } from '../types';

export const useStudentReport = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportData, setReportData] = useState<AttendanceReport | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const data = await getStudentAttendanceReport(token);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report:', error);
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadReport();
    setIsRefreshing(false);
  }, [loadReport]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return {
    handleRefresh,
    isLoading,
    isRefreshing,
    reportData,
  };
};
