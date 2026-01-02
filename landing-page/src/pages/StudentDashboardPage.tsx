import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Calendar, Clock, User, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

type ClassSlot = {
  id: number
  subject: string
  teacherName: string
  startTime: string
  endTime: string
  room: string
  dayOfWeek: string
  status?: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'NOT_MARKED'
}

type TabType = 'today' | 'week'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [selectedDay, setSelectedDay] = useState(0)
  const [todayClasses, setTodayClasses] = useState<ClassSlot[]>([])
  const [weekClasses, setWeekClasses] = useState<Record<string, ClassSlot[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimetable()
  }, [])

  const loadTimetable = async () => {
    try {
      setLoading(true)
      
      // Load today's timetable and attendance
      const today = new Date().toISOString().split('T')[0]
      const [todayResponse, attendanceResponse] = await Promise.all([
        api.get(`/student/timetable?date=${today}`),
        api.get(`/student/attendance?startDate=${today}&endDate=${today}`)
      ])
      
      // Create attendance map: timetableSlotId -> status
      const attendanceMap = new Map<number, string>()
      const attendanceData = attendanceResponse.data || []
      attendanceData.forEach((att: any) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status)
        }
      })
      
      // Map today's timetable with actual attendance status
      const todayData = (todayResponse.data || []).map((slot: any) => ({
        ...slot,
        startTime: slot.startTime?.substring(0, 5) || '00:00',
        endTime: slot.endTime?.substring(0, 5) || '00:00',
        status: attendanceMap.get(slot.id) || 'NOT_MARKED',
      }))
      setTodayClasses(todayData)

      // Load week timetable
      const weekResponse = await api.get('/student/timetable')
      const weekData = weekResponse.data || []
      
      const grouped: Record<string, ClassSlot[]> = {}
      weekData.forEach((slot: any) => {
        const day = slot.dayOfWeek
        if (!grouped[day]) grouped[day] = []
        grouped[day].push({
          ...slot,
          startTime: slot.startTime?.substring(0, 5) || '00:00',
          endTime: slot.endTime?.substring(0, 5) || '00:00',
          status: attendanceMap.get(slot.id) || 'NOT_MARKED',
        })
      })

      Object.keys(grouped).forEach(day => {
        grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
      })

      setWeekClasses(grouped)
    } catch (err) {
      console.error('Failed to load timetable', err)
      toast.error('Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    void navigate('/login')
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800'
      case 'ABSENT': return 'bg-red-100 text-red-800'
      case 'LEAVE': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderClass = (slot: ClassSlot) => (
    <div key={slot.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
          <p className="text-sm text-gray-600 mt-1">👨‍🏫 {slot.teacherName}</p>
          <p className="text-sm text-gray-600">🚪 Room: {slot.room || 'TBA'}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
          {slot.status?.replace('_', ' ') || 'Not Marked'}
        </span>
      </div>
    </div>
  )

  const dayMap: Record<string, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
  }

  const selectedDayKey = Object.keys(dayMap).find(k => dayMap[k] === selectedDay) || 'MONDAY'
  const selectedDayClasses = weekClasses[selectedDayKey] || []

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
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'week'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading timetable...</p>
          </div>
        ) : activeTab === 'today' ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
              <span className="text-sm text-gray-500">
                ({new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
              </span>
            </div>
            {todayClasses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No classes scheduled for today</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {todayClasses.map(renderClass)}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Week Schedule</h2>
            
            {/* Day Selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {days.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedDay === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {selectedDayClasses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No classes scheduled for {days[selectedDay]}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedDayClasses.map(renderClass)}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
