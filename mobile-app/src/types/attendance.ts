import { AttendanceStatus } from './common';

export interface AttendanceRecord {
  classId: number;
  className: string;
  date: string;
  id: number;
  status: AttendanceStatus;
  studentId: number;
  studentName: string;
}

export interface AttendanceRequest {
  classId: number;
  date: string;
  status: AttendanceStatus;
  studentId: number;
}

export interface DayAttendance {
  attendance: AttendanceRecord[];
  date: string;
}

export interface StudentAttendanceStats {
  percentagePresent: number;
  totalClasses: number;
  totalPresent: number;
}

export interface AttendanceWithStats {
  attendance: AttendanceRecord[];
  stats: StudentAttendanceStats;
}
