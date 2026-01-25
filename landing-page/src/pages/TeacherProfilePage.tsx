import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import PasswordResetModal from '@/components/PasswordResetModal';
import type { AxiosError } from 'axios';

interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  departmentId: number;
  isActive: boolean;
}

export default function TeacherProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [attendanceSummary, setAttendanceSummary] = useState<{
    percent: number;
    present: number;
    absent: number;
  } | null>(null);

  const [subjects, setSubjects] = useState<Array<{ name: string; percent: number }>>([]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void fetchProfile();
    void fetchAttendance();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // Get current user profile
      const response = await api.get<TeacherProfile>('/teacher/profile');
      setProfile(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error('Failed to fetch profile:', error);
      alert(axiosError.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendance = () => {
    // Teachers don't have personal attendance reports
    // They mark attendance for students instead
    setAttendanceSummary({ percent: 0, present: 0, absent: 0 });
    setSubjects([]);
  };

  const handleScroll = () => {
    const el = headerRef.current;
    const avatar = avatarRef.current;
    if (!el || !avatar) return;
    const rect = el.getBoundingClientRect();
    const offset = Math.max(0, -rect.top);
    const scale = Math.max(0.6, 1 - offset / 300);
    avatar.style.transform = `scale(${scale}) translateY(${Math.min(40, offset / 3)}px)`;
  };

  // Editing handled from settings drawer for teachers as well

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            ‹ Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            A quick view of your account and teaching performance
          </p>
        </div>

        {/* Profile Card */}
        <div ref={headerRef} className="bg-white shadow rounded-lg overflow-hidden relative">
          {/* Top gradient area */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 pt-8 pb-6">
            <div className="relative flex items-center justify-center">
              {/* Left: Edit (pencil) */}
              <button
                onClick={() => setShowSettings(true)}
                aria-label="Edit profile"
                className="absolute left-6 top-6 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414L16.707 4.293a1 1 0 00-1.414 0L6.878 12.707A1 1 0 006.585 13H2v4z"
                  />
                </svg>
              </button>

              {/* Right: Settings (gear) */}
              <button
                onClick={() => setShowSettings(true)}
                aria-label="Open settings"
                className="absolute right-6 top-6 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.558 1.01c.835-.5 1.9.27 1.64 1.21a1.724 1.724 0 00.95 2.058c.913.39.913 1.722 0 2.112a1.724 1.724 0 00-.95 2.058c.26.94-.805 1.71-1.64 1.21a1.724 1.724 0 00-2.558 1.01c-.299.921-1.602.921-1.902 0a1.724 1.724 0 00-2.558-1.01c-.835.5-1.9-.27-1.64-1.21a1.724 1.724 0 00-.95-2.058c-.913-.39-.913-1.722 0-2.112.35-.15.64-.41.95-.79"
                  />
                </svg>
              </button>

              <div
                ref={avatarRef}
                className="w-28 h-28 rounded-full border-4 border-white bg-blue-700 flex items-center justify-center transform transition-transform duration-150"
              >
                <span className="text-4xl font-bold text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <span className="inline-block mt-2 bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                Teacher
              </span>
            </div>
          </div>

          {/* Quick stats (attendance, present, absent) */}
          <div className="px-6 py-4 -mt-8">
            <div className="bg-white shadow-md rounded-lg p-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Attendance</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {attendanceSummary?.percent ?? '--'}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Present</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {attendanceSummary?.present ?? '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">Absent</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {attendanceSummary?.absent ?? '--'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="mt-6 bg-white shadow rounded-lg px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="w-full h-40">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth={3}
                points={subjects
                  .map(
                    (s, i) =>
                      `${(i / Math.max(1, subjects.length - 1)) * 200},${80 - (s.percent / 100) * 60}`
                  )
                  .join(' ')}
              />
            </svg>
          </div>
        </div>

        {/* Subject-wise report */}
        <div className="mt-6 bg-white shadow rounded-lg px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Report</h3>
          <div className="space-y-4">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-36 text-sm text-gray-600">{s.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 bg-blue-600 rounded-full"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium text-gray-700">
                  {s.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings drawer/modal tied to gear icon */}
        {showSettings && (
          <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-30"
              onClick={() => setShowSettings(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-50">
              <h4 className="text-lg font-semibold mb-3">Settings</h4>
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-600">Account Info</h5>
                <p className="text-sm text-gray-800 mt-1">
                  {profile?.name} • {profile?.email}
                </p>
                <p className="text-sm text-gray-500">Department: {profile?.departmentId}</p>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-600">Application Settings</h5>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <div>Notification preferences</div>
                  <div>Dark mode (user-level)</div>
                  <div>Email preferences</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowPasswordReset(true);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg"
                >
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/logout';
                  }}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal isOpen={showPasswordReset} onClose={() => setShowPasswordReset(false)} />
    </div>
  );
}
