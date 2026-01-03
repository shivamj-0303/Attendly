export type {
  AttendanceRecord,
  AttendanceRequest,
  AttendanceWithStats,
  DayAttendance,
  StudentAttendanceStats,
} from './attendance';

export type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from './auth';

export type { Class, ClassStudent, ClassWithStudents } from './class';

export type { AttendanceStatus, DayOfWeek, TabType, UserRole } from './common';

export { DAY_MAP, DAYS, DAYS_OF_WEEK } from './common';

export type { AttendanceReport, SubjectAttendanceSummary } from './report';

export type { Student, StudentDetails } from './student';

export type { Teacher, TeacherDetails } from './teacher';

export type { TimetableDay, TimetableSlot, TimetableSlotRequest } from './timetable';
