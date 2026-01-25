import { useState, useEffect } from 'react';
import api from '../services/api';

export interface SubjectAttendanceSummary {
  subjectName: string;
  totalClasses: number;
  classesPresent: number;
  percentage: number;
}

export interface AttendanceReportResponse {
  overallPercentage: number;
  totalClasses: number;
  classesPresent: number;
  subjectBreakdown: SubjectAttendanceSummary[];
}

export const useAttendanceReport = () => {
  const [data, setData] = useState<AttendanceReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<AttendanceReportResponse>('/student/attendance/report');
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch attendance report:', err);
        setError(err.response?.data?.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<AttendanceReportResponse>('/student/attendance/report');
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch attendance report:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
