import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AttendanceStatus, TabType, TimetableSlot } from '@/types';
import { DAY_MAP, type DayOfWeek } from '@/types/common';

interface AttendanceRecord {
  date: string;
  id: number;
  status: AttendanceStatus;
  studentId: number;
  timetableSlotId: number;
}

interface ClassSlotWithStatus extends TimetableSlot {
  status?: AttendanceStatus;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [todayClasses, setTodayClasses] = useState<ClassSlotWithStatus[]>([]);
  const [weekClasses, setWeekClasses] = useState<Record<string, ClassSlotWithStatus[]>>({});

  useEffect(() => {
    void loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const [todayResponse, attendanceResponse] = await Promise.all([
        api.get<TimetableSlot[]>(`/student/timetable?date=${today}`),
        api.get<AttendanceRecord[]>(`/student/attendance?startDate=${today}&endDate=${today}`),
      ]);

      // Create attendance map: timetableSlotId -> status
      const attendanceMap = new Map<number, AttendanceStatus>();
      const attendanceData = attendanceResponse.data ?? [];
      attendanceData.forEach((att) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status);
        }
      });

      // Map today's timetable with actual attendance status
      const todayData = (todayResponse.data ?? []).map((slot) => ({
        ...slot,
        endTime: slot.endTime?.substring(0, 5) ?? '00:00',
        startTime: slot.startTime?.substring(0, 5) ?? '00:00',
        status: attendanceMap.get(slot.id) ?? ('NOT_MARKED' as AttendanceStatus),
      }));
      setTodayClasses(todayData);

      // Load week timetable
      const weekResponse = await api.get<TimetableSlot[]>('/student/timetable');
      const weekData = weekResponse.data ?? [];

      const grouped: Record<string, ClassSlotWithStatus[]> = {};
      weekData.forEach((slot) => {
        const day = slot.dayOfWeek;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push({
          ...slot,
          endTime: slot.endTime?.substring(0, 5) ?? '00:00',
          startTime: slot.startTime?.substring(0, 5) ?? '00:00',
          status: attendanceMap.get(slot.id) ?? ('NOT_MARKED' as AttendanceStatus),
        });
      });

      Object.keys(grouped).forEach((day) => {
        grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      setWeekClasses(grouped);
    } catch (err) {
      console.error('Failed to load timetable', err);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    void navigate('/login');
  };

  const getStatusColor = (status: AttendanceStatus = 'NOT_MARKED') => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'LEAVE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderClass = (slot: ClassSlotWithStatus) => (
    <div key={slot.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
          <p className="text-sm text-gray-600 mt-1">👨‍🏫 {slot.teacherName}</p>
          <p className="text-sm text-gray-600">🚪 Room: {slot.room ?? 'TBA'}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}
        >
          {slot.status?.replace('_', ' ') ?? 'Not Marked'}
        </span>
      </div>
    </div>
  );

  const selectedDayKey =
    (Object.keys(DAY_MAP) as DayOfWeek[]).find((k) => DAY_MAP[k] === selectedDay) ?? 'MONDAY';
  const selectedDayClasses = weekClasses[selectedDayKey] ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Attendly</h1>
                <p className="text-sm text-gray-600">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6 w-fit">
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        ) : (
          <>
            {/* Today's Classes */}
            {activeTab === 'today' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">Today&apos;s Classes</h2>
                  <span className="text-sm text-gray-500">
                    (
                    {new Date().toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      weekday: 'long',
                      year: 'numeric',
                    })}
                    )
                  </span>
                </div>
                {todayClasses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-600">No classes scheduled for today</p>
                  </div>
                ) : (
                  <div className="grid gap-4">{todayClasses.map((slot) => renderClass(slot))}</div>
                )}
              </div>
            )}

            {/* Week Schedule */}
            {activeTab === 'week' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Week Schedule</h2>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {DAYS.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedDay === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {selectedDayClasses.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-600">No classes scheduled for {DAYS[selectedDay]}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {selectedDayClasses.map((slot) => renderClass(slot))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
