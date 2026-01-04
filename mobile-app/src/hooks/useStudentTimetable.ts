import { useCallback, useEffect, useState } from 'react';

import { getStudentAttendance, getStudentTimetable } from '../services/api';
import { DAY_MAP, TimetableSlot } from '../types';

import type { StudentClassItem } from '../components/StudentClassCard';

export const useStudentTimetable = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [todayClasses, setTodayClasses] = useState<StudentClassItem[] | null>(null);
  const [weekClasses, setWeekClasses] = useState<Record<number, StudentClassItem[]>>({});

  const mapSlotToClassItem = useCallback(
    (slot: any, attendanceMap: Map<number, string>): StudentClassItem => {
      const status = (attendanceMap.get(slot.id) ?? 'NOT_MARKED').toLowerCase() as
        | 'absent'
        | 'leave'
        | 'not_marked'
        | 'present';

      return {
        end: slot.endTime?.substring(0, 5) ?? '00:00',
        id: slot.id?.toString() ?? Math.random().toString(),
        start: slot.startTime?.substring(0, 5) ?? '00:00',
        status,
        subject: slot.subject ?? 'Unknown',
        teacher: slot.teacherName ?? 'TBA',
      };
    },
    []
  );

  const loadToday = useCallback(async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const [timetableData, attendanceData] = await Promise.all([
        getStudentTimetable(dateStr),
        getStudentAttendance(dateStr),
      ]);

      const attendanceMap = new Map<number, string>();
      (attendanceData ?? []).forEach((att: any) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status);
        }
      });

      const mapped: StudentClassItem[] = (timetableData ?? []).map((slot: any) =>
        mapSlotToClassItem(slot, attendanceMap)
      );

      mapped.sort((a, b) => a.start.localeCompare(b.start));
      setTodayClasses(mapped);
    } catch (err) {
      console.warn('Failed to load today timetable', err);
      setTodayClasses([]);
    }
  }, [mapSlotToClassItem]);

  const loadWeek = useCallback(async () => {
    try {
      const data = await getStudentTimetable();

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const attendanceData = await getStudentAttendance(dateStr);

      const attendanceMap = new Map<number, string>();
      (attendanceData ?? []).forEach((att: any) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status);
        }
      });

      const week: Record<number, StudentClassItem[]> = {};

      // Initialize empty arrays for all 7 days
      for (let i = 0; i < 7; i++) {
        week[i] = [];
      }

      (data ?? []).forEach((slot: TimetableSlot) => {
        const dayIndex = DAY_MAP[slot.dayOfWeek];
        if (dayIndex !== undefined) {
          week[dayIndex].push(mapSlotToClassItem(slot, attendanceMap));
        }
      });

      Object.keys(week).forEach((key) => {
        week[parseInt(key)].sort((a, b) => a.start.localeCompare(b.start));
      });

      setWeekClasses(week);
    } catch (err) {
      console.warn('Failed to load week timetable', err);
      const emptyWeek: Record<number, StudentClassItem[]> = {};
      for (let i = 0; i < 7; i++) {
        emptyWeek[i] = [];
      }
      setWeekClasses(emptyWeek);
    }
  }, [mapSlotToClassItem]);

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
    loadToday,
    loadWeek,
    selectedDayIndex,
    setSelectedDayIndex,
    todayClasses,
    weekClasses,
  };
};
