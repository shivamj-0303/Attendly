import { Check } from 'lucide-react';
import type { AttendanceStatus, Student } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface AttendanceListProps {
  loading: boolean;
  onMarkAllAbsent: () => void;
  onToggleAttendance: (studentId: number, status: AttendanceStatus) => void;
  students: Student[];
}

export const AttendanceList = ({
  students,
  loading,
  onToggleAttendance,
  onMarkAllAbsent,
}: AttendanceListProps) => {
  if (loading) {
    return <LoadingSpinner text="Loading students..." />;
  }

  if (students.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No students found in this class</p>
      </div>
    );
  }

  const presentCount = students.filter((s) => s.attendanceStatus === 'PRESENT').length;
  const absentCount = students.filter((s) => s.attendanceStatus === 'ABSENT').length;
  const notMarkedCount = students.filter(
    (s) => !s.attendanceStatus || s.attendanceStatus === 'NOT_MARKED'
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-gray-600">Present</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          <p className="text-xs text-gray-600">Absent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{notMarkedCount}</p>
          <p className="text-xs text-gray-600">Not Marked</p>
        </div>
      </div>

      {/* Quick Actions */}
      <button
        onClick={onMarkAllAbsent}
        className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Mark All Absent
      </button>

      {/* Student List */}
      <div className="max-h-96 space-y-2 overflow-y-auto">
        {students.map((student) => {
          const isPresent = student.attendanceStatus === 'PRESENT';
          const isAbsent = student.attendanceStatus === 'ABSENT';

          return (
            <div
              key={student.id}
              className="flex items-center justify-between rounded-lg border bg-white p-3 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleAttendance(student.id, 'PRESENT')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isPresent
                      ? 'bg-green-600 text-white'
                      : 'border border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {isPresent && <Check className="h-4 w-4" />}
                  Present
                </button>
                <button
                  onClick={() => onToggleAttendance(student.id, 'ABSENT')}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isAbsent
                      ? 'bg-red-600 text-white'
                      : 'border border-red-600 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {isAbsent && <Check className="h-4 w-4" />}
                  Absent
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
