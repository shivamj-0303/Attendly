export interface SubjectAttendanceSummary {
  classesPresent: number;
  percentage: number;
  subjectName: string;
  totalClasses: number;
}

export interface AttendanceReport {
  classesPresent: number;
  overallPercentage: number;
  subjectBreakdown: SubjectAttendanceSummary[];
  totalClasses: number;
}
