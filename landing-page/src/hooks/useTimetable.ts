import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { TimetableSlot } from '../types';

export const useTimetable = (teacherId?: number, date?: string) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = teacherId
        ? `/teacher/timetable${date ? `?date=${date}` : ''}`
        : `/student/timetable${date ? `?date=${date}` : ''}`;
      const response = await api.get<TimetableSlot[]>(endpoint);
      setTimetable(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, [teacherId, date]);

  useEffect(() => {
    void fetchTimetable();
  }, [fetchTimetable]);

  return { error, loading, refetch: fetchTimetable, timetable };
};
