import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Student } from '../types';

export const useStudents = (classId?: number) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = useCallback(async () => {
    if (!classId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Student[]>(`/admin/classes/${classId}/students`);
      setStudents(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  return { error, loading, refetch: fetchStudents, students };
};
