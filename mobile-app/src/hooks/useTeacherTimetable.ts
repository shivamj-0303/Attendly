import { useCallback, useEffect, useState } from 'react';

import { getClassStudents, getTeacherTimetable, markAttendance } from '../services/api';
import { AttendanceStatus, DAY_MAP, TimetableSlot } from '../types';

import type { ClassItem, Student } from '../components';

export const useTeacherTimetable = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [todayClasses, setTodayClasses] = useState<ClassItem[] | null>(null);
  const [weekClasses, setWeekClasses] = useState<Record<number, ClassItem[]>>({});

  const mapSlotToClassItem = useCallback((slot: any): ClassItem => {
    return {
      classId: slot.classId,
      className: slot.className ?? `Class ${slot.classId}`,
      dayOfWeek: slot.dayOfWeek,
      end: slot.endTime?.substring(0, 5) ?? '00:00',
      id: `${slot.id}-${slot.classId}`,
      room: slot.room ?? 'TBA',
      slotId: slot.id,
      start: slot.startTime?.substring(0, 5) ?? '00:00',
      subject: slot.subject ?? 'Unknown',
    };
  }, []);

  const loadToday = useCallback(async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const data = await getTeacherTimetable(dateStr);

      const mapped: ClassItem[] = (data ?? []).map(mapSlotToClassItem);
      mapped.sort((a, b) => a.start.localeCompare(b.start));

      setTodayClasses(mapped);
    } catch (err) {
      console.warn('Failed to load today timetable', err);
      setTodayClasses([]);
    }
  }, [mapSlotToClassItem]);

  const loadWeek = useCallback(async () => {
    try {
      const data = await getTeacherTimetable();
      const week: Record<number, ClassItem[]> = {};

      // Initialize empty arrays for all 7 days
      for (let i = 0; i < 7; i++) {
        week[i] = [];
      }

      // Group by day
      (data ?? []).forEach((slot: TimetableSlot) => {
        const dayIndex = DAY_MAP[slot.dayOfWeek];
        if (dayIndex !== undefined) {
          week[dayIndex].push(mapSlotToClassItem(slot));
        }
      });

      // Sort each day
      Object.keys(week).forEach((key) => {
        week[parseInt(key)].sort((a, b) => a.start.localeCompare(b.start));
      });

      setWeekClasses(week);
    } catch (err) {
      console.warn('Failed to load week timetable', err);
      const emptyWeek: Record<number, ClassItem[]> = {};
      for (let i = 0; i < 7; i++) {
        emptyWeek[i] = [];
      }
      setWeekClasses(emptyWeek);
    }
  }, [mapSlotToClassItem]);

  const loadClassStudents = useCallback(async (classId: number, slotId: number) => {
    setLoadingStudents(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getClassStudents(classId, slotId, today);
      setStudents(data ?? []);
    } catch (err) {
      console.warn('Failed to load students', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const markAllAbsent = useCallback(() => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendanceStatus: 'ABSENT' as const })));
  }, []);

  const saveAttendance = useCallback(
    async (selectedClass: ClassItem | null): Promise<boolean> => {
      if (!selectedClass) return false;

      try {
        const today = new Date().toISOString().split('T')[0];
        const attendanceData = students.map((s) => ({
          date: today,
          status: s.attendanceStatus ?? 'ABSENT',
          studentId: s.id,
          timetableSlotId: selectedClass.slotId,
        }));

        await markAttendance(attendanceData);
        await loadToday();
        return true;
      } catch (err: any) {
        console.error('Failed to mark attendance', err);
        return false;
      }
    },
    [loadToday, students]
  );

  const toggleStudentAttendance = useCallback(
    (studentId: number, status: AttendanceStatus) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, attendanceStatus: status } : s))
      );
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([loadToday(), loadWeek()]);
    setIsRefreshing(false);
  }, [loadToday, loadWeek]);

  useEffect(() => {
    loadToday();
    loadWeek();
  }, [loadToday, loadWeek]);

  return {
    handleRefresh,
    isRefreshing,
    loadClassStudents,
    loadToday,
    loadWeek,
    loadingStudents,
    markAllAbsent,
    saveAttendance,
    selectedDayIndex,
    setSelectedDayIndex,
    students,
    todayClasses,
    toggleStudentAttendance,
    weekClasses,
  };
};
