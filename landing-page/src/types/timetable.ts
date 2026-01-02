// Timetable types
export interface TimetableSlot {
  id: number;
  classId: number;
  className?: string;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  teacherId: number;
  teacherName: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimetableSlotRequest {
  classId: number;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  teacherId: number;
  teacherName: string;
  notes?: string;
}

export interface UpdateTimetableSlotRequest {
  subject?: string;
  room?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
}
