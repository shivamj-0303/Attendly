import { DayOfWeek } from './common';

export interface TimetableSlot {
  classId: number;
  className: string;
  dayOfWeek: DayOfWeek;
  endTime: string;
  id: number;
  startTime: string;
  teacherId: number;
  teacherName: string;
}

export interface TimetableDay {
  day: DayOfWeek;
  slots: TimetableSlot[];
}

export interface TimetableSlotRequest {
  classId: number;
  dayOfWeek: DayOfWeek;
  endTime: string;
  startTime: string;
  teacherId: number;
}
