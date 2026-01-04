import { useEffect, useState } from 'react';
import { Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { AttendanceList, Button, ClassCard, DayTabs, LoadingSpinner, Modal, ProfileDropdown } from '@/components';
import api from '@/lib/api';
import type { AttendanceStatus, DayOfWeek, Student, TabType, TimetableSlot } from '@/types';
import { DAY_MAP } from '@/types/common';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDay, setSelectedDay] = useState(0);
  const [todayClasses, setTodayClasses] = useState<TimetableSlot[]>([]);
  const [weekClasses, setWeekClasses] = useState<Record<string, TimetableSlot[]>>({});
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState<TimetableSlot | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    void loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Load today's classes
      const todayResponse = await api.get<TimetableSlot[]>(`/teacher/timetable?date=${today}`);
      setTodayClasses(todayResponse.data || []);

      // Load week schedule
      const weekResponse = await api.get<TimetableSlot[]>('/teacher/timetable');
      const grouped: Record<string, TimetableSlot[]> = {};

      (weekResponse.data || []).forEach((slot) => {
        if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
        grouped[slot.dayOfWeek].push(slot);
      });

      // Sort each day by start time
      Object.keys(grouped).forEach((day) => {
        grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      setWeekClasses(grouped);
    } catch (error) {
      console.error('Failed to load timetable', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const loadClassStudents = async (classSlot: TimetableSlot) => {
    setLoadingStudents(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get<Student[]>(`/teacher/class/${classSlot.classId}/students`, {
        params: { slotId: classSlot.id, date: today },
      });
      setStudents(response.data || []);
    } catch (error) {
      console.error('Failed to load students', error);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassClick = (classSlot: TimetableSlot) => {
    if (activeTab !== 'today') {
      toast.error("Attendance can only be marked for today's classes");
      return;
    }
    setSelectedClass(classSlot);
    void loadClassStudents(classSlot);
  };

  const toggleAttendance = (studentId: number, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, attendanceStatus: status } : s))
    );
  };

  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, attendanceStatus: 'ABSENT' as AttendanceStatus }))
    );
    toast.success('All students marked as absent');
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = students.map((s) => ({
        timetableSlotId: selectedClass.id,
        studentId: s.id,
        date: today,
        status: s.attendanceStatus || 'ABSENT',
      }));

      await api.post('/admin/attendance/mark/bulk', attendanceData);
      toast.success('Attendance marked successfully');
      setSelectedClass(null);
      setStudents([]);
    } catch (error) {
      console.error('Failed to mark attendance', error);
      toast.error('Failed to mark attendance');
    }
  };

  const selectedDayKey =
    (Object.keys(DAY_MAP) as DayOfWeek[]).find((k) => DAY_MAP[k] === selectedDay) || 'MONDAY';
  const selectedDayClasses = weekClasses[selectedDayKey] || [];

  if (loading) {
    return <LoadingSpinner text="Loading schedule..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Attendly</h1>
                <p className="text-sm text-gray-600">Teacher Portal</p>
              </div>
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 w-fit rounded-lg bg-white p-1 shadow-sm">
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('today')}
              variant={activeTab === 'today' ? 'primary' : 'ghost'}
              size="md"
            >
              Today
            </Button>
            <Button
              onClick={() => setActiveTab('week')}
              variant={activeTab === 'week' ? 'primary' : 'ghost'}
              size="md"
            >
              Week
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'today' ? (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Today&apos;s Classes</h2>
              <span className="text-sm text-gray-500">
                (
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                )
              </span>
            </div>
            {todayClasses.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow">
                <p className="text-gray-600">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {todayClasses.map((slot) => (
                  <ClassCard
                    key={slot.id}
                    slot={slot}
                    onClick={() => handleClassClick(slot)}
                    showMarkButton
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Week Schedule</h2>
            <div className="mb-6">
              <DayTabs days={DAYS} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
            </div>
            {selectedDayClasses.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow">
                <p className="text-gray-600">No classes scheduled for {DAYS[selectedDay]}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedDayClasses.map((slot) => (
                  <ClassCard key={slot.id} slot={slot} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Attendance Modal */}
      {selectedClass && (
        <Modal
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          title="Mark Attendance"
          size="xl"
          footer={
            <div className="flex gap-3">
              <Button onClick={() => setSelectedClass(null)} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => void saveAttendance()} variant="primary" className="flex-1">
                Save Attendance
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Class</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedClass.className || `Class ${selectedClass.classId}`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Subject</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClass.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Room</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClass.room || 'TBA'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedClass.startTime} - {selectedClass.endTime}
                </p>
              </div>
            </div>

            <AttendanceList
              students={students}
              loading={loadingStudents}
              onToggleAttendance={toggleAttendance}
              onMarkAllAbsent={markAllAbsent}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
