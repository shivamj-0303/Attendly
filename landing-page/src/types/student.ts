// Student types
import type { AttendanceStatus } from './attendance';

export interface Student {
  adminId: number;
  attendanceStatus?: AttendanceStatus;
  classId: number;
  className?: string;
  createdAt?: string;
  departmentId: number;
  departmentName?: string;
  email: string;
  id: number;
  isActive: boolean;
  name: string;
  phone: string;
  rollNumber: string;
  updatedAt?: string;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  rollNumber: string;
  classId: number;
  departmentId: number;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phone?: string;
  rollNumber?: string;
  classId?: number;
  isActive?: boolean;
}
