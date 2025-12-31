import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import type { AxiosError } from 'axios'

interface TimetableSlot {
  id: number
  classId: number
  subject: string
  teacherId: number
  teacherName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  notes?: string
  isActive: boolean
}

interface Class {
  id: number
  name: string
  semester: number
  year: number
}

interface ErrorResponse {
  message?: string
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
]

export default function TimetablePage() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const { data: classData } = useQuery<Class>({
    queryKey: ['class', classId],
    queryFn: async () => {
      const res = await api.get<Class>(`/admin/classes/${classId}`)
      return res.data
    },
  })

  const { data: timetableSlots = [], isLoading } = useQuery<TimetableSlot[]>({
    queryKey: ['timetable', classId],
    queryFn: async () => {
      const res = await api.get<TimetableSlot[]>(`/admin/timetable/class/${classId}`)
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (slotId: number) => {
      await api.delete(`/admin/timetable/${slotId}`)
    },
    onSuccess: () => {
      toast.success('Timetable slot deleted successfully!')
      void queryClient.invalidateQueries({ queryKey: ['timetable'] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to delete slot')
    },
  })

  const handleCellClick = (day: string, time: string) => {
    // Check if there's already a slot at this time
    const existingSlot = timetableSlots.find((slot) => {
      const slotStart = slot.startTime.substring(0, 5)
      const slotEnd = slot.endTime.substring(0, 5)
      return slot.dayOfWeek === day && slotStart <= time && slotEnd > time
    })

    if (existingSlot) {
      setSelectedSlot(existingSlot)
    } else {
      setSelectedSlot(null)
      setSelectedDay(day)
      setSelectedTime(time)
    }
    setShowSlotModal(true)
  }

  const handleEdit = (slot: TimetableSlot, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSlot(slot)
    setSelectedDay(null)
    setSelectedTime(null)
    setShowSlotModal(true)
  }

  const getSlotAtTime = (day: string, time: string): TimetableSlot | undefined => {
    return timetableSlots.find(
      (slot) => {
        const slotStart = slot.startTime.substring(0, 5) // Get HH:MM from HH:MM:SS
        const slotEnd = slot.endTime.substring(0, 5)
        return (
          slot.dayOfWeek === day &&
          slotStart <= time &&
          slotEnd > time &&
          slot.isActive
        )
      },
    )
  }

  const getSlotSpan = (slot: TimetableSlot): number => {
    const slotStart = slot.startTime.substring(0, 5)
    const slotEnd = slot.endTime.substring(0, 5)
    const startIndex = TIMES.indexOf(slotStart)
    const endIndex = TIMES.indexOf(slotEnd)
    if (startIndex === -1 || endIndex === -1) return 1
    return endIndex - startIndex
  }

  const shouldRenderSlot = (slot: TimetableSlot, time: string): boolean => {
    const slotStart = slot.startTime.substring(0, 5)
    return slotStart === time
  }

  return (
    <div className="pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Timetable - {classData?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Click on any time slot to add or edit schedule
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading timetable...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b sticky left-0 bg-gray-50 z-10">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b min-w-[150px]"
                    >
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((time) => (
                  <tr key={time} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600 font-medium border-r sticky left-0 bg-white z-10">
                      {time}
                    </td>
                    {DAYS.map((day) => {
                      const slot = getSlotAtTime(day, time)
                      const shouldRender = slot && shouldRenderSlot(slot, time)
                      const span = slot ? getSlotSpan(slot) : 1

                      if (slot && !shouldRender) {
                        // This cell is covered by a slot starting earlier
                        return null
                      }

                      return (
                        <td
                          key={`${day}-${time}`}
                          rowSpan={shouldRender ? span : 1}
                          onClick={() => slot ? handleEdit(slot, { stopPropagation: () => {} } as React.MouseEvent) : handleCellClick(day, time)}
                          className={`px-0 py-0 border-r border-l relative group ${
                            slot ? 'cursor-pointer bg-blue-100 hover:bg-blue-200' : 'cursor-pointer hover:bg-blue-50'
                          }`}
                        >
                          {shouldRender && slot ? (
                            <div className="w-full h-full p-3">
                              <div className="font-semibold text-sm text-gray-900">
                                {slot.subject}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {slot.teacherName}
                              </div>
                              {slot.room && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Room: {slot.room}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                              </div>
                            </div>
                          ) : (
                            !slot && (
                              <div className="text-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity py-4">
                                +
                              </div>
                            )
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSlotModal && (
        <TimetableSlotModal
          classId={classId ?? ''}
          slot={selectedSlot}
          initialDay={selectedDay ?? undefined}
          initialTime={selectedTime ?? undefined}
          onClose={() => {
            setShowSlotModal(false)
            setSelectedSlot(null)
            setSelectedDay(null)
            setSelectedTime(null)
          }}
          onSuccess={() => {
            setShowSlotModal(false)
            setSelectedSlot(null)
            setSelectedDay(null)
            setSelectedTime(null)
            void queryClient.invalidateQueries({ queryKey: ['timetable'] })
          }}
          onDelete={(slotId: number) => {
            deleteMutation.mutate(slotId)
            setShowSlotModal(false)
            setSelectedSlot(null)
          }}
        />
      )}
    </div>
  )
}

interface TimetableSlotModalProps {
  classId: string
  slot: TimetableSlot | null
  initialDay?: string
  initialTime?: string
  onClose: () => void
  onSuccess: () => void
  onDelete: (slotId: number) => void
}

function TimetableSlotModal({
  classId,
  slot,
  initialDay,
  initialTime,
  onClose,
  onSuccess,
  onDelete,
}: TimetableSlotModalProps) {
  const [formData, setFormData] = useState({
    classId: Number(classId),
    subject: slot?.subject || '',
    teacherId: slot?.teacherId || 0,
    dayOfWeek: slot?.dayOfWeek || initialDay || 'MONDAY',
    startTime: slot?.startTime || initialTime || '09:00',
    endTime: slot?.endTime || '10:00',
    room: slot?.room || '',
    notes: slot?.notes || '',
  })

  const { data: teachers = [] } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get<Array<{ id: number; name: string }>>('/admin/teachers')
      return res.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (slot) {
        await api.put(`/admin/timetable/${slot.id}`, formData)
      } else {
        await api.post('/admin/timetable', formData)
      }
    },
    onSuccess: () => {
      toast.success(
        slot ? 'Timetable slot updated successfully!' : 'Timetable slot created successfully!',
      )
      onSuccess()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to save timetable slot')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.subject.trim()) {
      toast.error('Subject is required')
      return
    }
    if (!formData.teacherId) {
      toast.error('Teacher is required')
      return
    }
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time')
      return
    }

    saveMutation.mutate()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {slot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={!!initialDay}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {TIMES.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Room 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {slot && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this timetable slot?')) {
                    onDelete(slot.id)
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : slot ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
