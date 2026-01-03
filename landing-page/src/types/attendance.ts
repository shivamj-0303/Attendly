// Attendance types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'NOT_MARKED';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName?: string;
  rollNumber?: string;
  timetableSlotId: number;
  date: string;
  status: AttendanceStatus;
  markedBy: number;
  markedByName?: string;
  markedAt?: string;
  notes?: string;
}

export interface MarkAttendanceRequest {
  studentId: number;
  timetableSlotId: number;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkMarkAttendanceRequest {
  attendance: MarkAttendanceRequest[];
}

export interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}
