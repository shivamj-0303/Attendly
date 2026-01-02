import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { AttendanceRecord } from '../types';

interface UseAttendanceOptions {
  endDate?: string;
  startDate?: string;
  studentId?: number;
}

export const useAttendance = ({ endDate, startDate, studentId }: UseAttendanceOptions = {}) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = useCallback(async () => {
    if (!studentId) return;

    setLoading(true);
    setError(null);
    try {
      let endpoint = '/student/attendance';
      if (startDate && endDate) {
        endpoint += `?startDate=${startDate}&endDate=${endDate}`;
      } else {
        endpoint += '/today';
      }

      const response = await api.get<AttendanceRecord[]>(endpoint);
      setAttendance(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [studentId, startDate, endDate]);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  return { attendance, error, loading, refetch: fetchAttendance };
};
