import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Calendar, Clock, User, LogOut, X, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

type ClassSlot = {
  id: string
  slotId: number
  classId: number
  className: string
  subject: string
  room: string
  startTime: string
  endTime: string
  dayOfWeek: string
}

type Student = {
  id: number
  name: string
  rollNumber: string
  email: string
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'NOT_MARKED'
}

type TabType = 'today' | 'week'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function TeacherDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('today')
  const [selectedDay, setSelectedDay] = useState(0)
  const [todayClasses, setTodayClasses] = useState<ClassSlot[]>([])
  const [weekClasses, setWeekClasses] = useState<Record<string, ClassSlot[]>>({})
  const [loading, setLoading] = useState(true)
  
  // Attendance modal
  const [selectedClass, setSelectedClass] = useState<ClassSlot | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  // Editing
  const [editingSubject, setEditingSubject] = useState(false)
  const [editingRoom, setEditingRoom] = useState(false)
  const [tempSubject, setTempSubject] = useState('')
  const [tempRoom, setTempRoom] = useState('')

  useEffect(() => {
    loadTimetable()
  }, [])

  const loadTimetable = async () => {
    try {
      setLoading(true)
      
      // Load today's timetable
      const today = new Date().toISOString().split('T')[0]
      const todayResponse = await api.get(`/teacher/timetable?date=${today}`)
      const todayData = (todayResponse.data || []).map((slot: any) => ({
        id: `${slot.id}-${slot.classId}`,
        slotId: slot.id,
        classId: slot.classId,
        className: slot.className || `Class ${slot.classId}`,
        subject: slot.subject,
        room: slot.room || 'TBA',
        startTime: slot.startTime?.substring(0, 5) || '00:00',
        endTime: slot.endTime?.substring(0, 5) || '00:00',
        dayOfWeek: slot.dayOfWeek,
      }))
      setTodayClasses(todayData)

      // Load week timetable
      const weekResponse = await api.get('/teacher/timetable')
      const weekData = weekResponse.data || []
      
      const grouped: Record<string, ClassSlot[]> = {}
      weekData.forEach((slot: any) => {
        const day = slot.dayOfWeek
        if (!grouped[day]) grouped[day] = []
        grouped[day].push({
          id: `${slot.id}-${slot.classId}`,
          slotId: slot.id,
          classId: slot.classId,
          className: slot.className || `Class ${slot.classId}`,
          subject: slot.subject,
          room: slot.room || 'TBA',
          startTime: slot.startTime?.substring(0, 5) || '00:00',
          endTime: slot.endTime?.substring(0, 5) || '00:00',
          dayOfWeek: slot.dayOfWeek,
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

  const loadClassStudents = async (classSlot: ClassSlot) => {
    setLoadingStudents(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get(`/teacher/class/${classSlot.classId}/students`, {
        params: { slotId: classSlot.slotId, date: today }
      })
      setStudents(response.data || [])
    } catch (err) {
      console.error('Failed to load students', err)
      toast.error('Failed to load students')
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleClassClick = (classSlot: ClassSlot) => {
    if (activeTab === 'today') {
      setSelectedClass(classSlot)
      setTempSubject(classSlot.subject)
      setTempRoom(classSlot.room)
      loadClassStudents(classSlot)
    } else {
      toast.error('Attendance can only be marked for today\'s classes')
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    void navigate('/login')
  }

  const markAllAbsent = () => {
    setStudents(prev => prev.map(s => ({ ...s, attendanceStatus: 'ABSENT' as const })))
    toast.success('All students marked as absent')
  }

  const toggleAttendance = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, attendanceStatus: status } : s))
    )
  }

  const saveAttendance = async () => {
    if (!selectedClass) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const attendanceData = students.map(s => ({
        timetableSlotId: selectedClass.slotId,
        studentId: s.id,
        date: today,
        status: s.attendanceStatus || 'ABSENT',
      }))

      await api.post('/admin/attendance/mark/bulk', attendanceData)
      toast.success('Attendance marked successfully')
      setSelectedClass(null)
      setStudents([])
    } catch (err: any) {
      console.error('Failed to mark attendance', err)
      toast.error(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  const saveSubjectEdit = () => {
    if (selectedClass) {
      selectedClass.subject = tempSubject
      setEditingSubject(false)
      toast.success('Subject updated (local only)')
    }
  }

  const saveRoomEdit = () => {
    if (selectedClass) {
      selectedClass.room = tempRoom
      setEditingRoom(false)
      toast.success('Room updated (local only)')
    }
  }

  const renderClass = (slot: ClassSlot) => (
    <div
      key={slot.id}
      onClick={() => activeTab === 'today' && handleClassClick(slot)}
      className={`bg-white rounded-lg shadow p-4 transition-all ${
        activeTab === 'today' ? 'hover:shadow-lg cursor-pointer hover:border-green-500' : ''
      } border-2 border-transparent`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
          <p className="text-sm text-gray-600 mt-1">📚 {slot.className}</p>
          <p className="text-sm text-gray-600">🚪 Room: {slot.room}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
        </div>
        {activeTab === 'today' && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            Mark Attendance
          </div>
        )}
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
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Attendly</h1>
                <p className="text-sm text-gray-600">Teacher Portal</p>
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
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'week'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        ) : activeTab === 'today' ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Today's Classes</h2>
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
                      ? 'bg-green-600 text-white shadow-md'
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

      {/* Attendance Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Class Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Class</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedClass.className}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Subject</p>
                    {editingSubject ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempSubject}
                          onChange={(e) => setTempSubject(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-lg"
                          autoFocus
                        />
                        <button onClick={saveSubjectEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">{selectedClass.subject}</p>
                        <button onClick={() => setEditingSubject(true)} className="text-blue-600 hover:text-blue-700">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Room</p>
                    {editingRoom ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempRoom}
                          onChange={(e) => setTempRoom(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-lg"
                          autoFocus
                        />
                        <button onClick={saveRoomEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900">{selectedClass.room}</p>
                        <button onClick={() => setEditingRoom(true)} className="text-blue-600 hover:text-blue-700">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedClass.startTime} - {selectedClass.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mark All Absent Button */}
              <button
                onClick={markAllAbsent}
                className="w-full mb-4 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Mark All Absent
              </button>

              {/* Students List */}
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Students ({students.length})
              </h3>

              {loadingStudents ? (
                <p className="text-center text-gray-600 py-8">Loading students...</p>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAttendance(student.id, 'PRESENT')}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            student.attendanceStatus === 'PRESENT'
                              ? 'bg-green-600 text-white'
                              : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => toggleAttendance(student.id, 'ABSENT')}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            student.attendanceStatus === 'ABSENT'
                              ? 'bg-red-600 text-white'
                              : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectedClass(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveAttendance}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
