import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Search, Plus, Calendar } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import type { AxiosError } from 'axios'

interface Class {
  id: number
  name: string
  semester: number
  year: number
  isActive: boolean
}

interface Department {
  id: number
  name: string
  code: string
  description: string
  isActive: boolean
}

interface ErrorResponse {
  message?: string
}

export default function ClassesPage() {
  const { id: departmentId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const { data: department } = useQuery<Department>({
    queryKey: ['department', departmentId],
    queryFn: async () => {
      const res = await api.get<Department>(`/admin/departments/${departmentId}`)
      return res.data
    },
  })

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ['classes', departmentId, searchQuery],
    queryFn: async () => {
      const url = searchQuery
        ? `/admin/classes/search?q=${encodeURIComponent(searchQuery)}&departmentId=${departmentId}`
        : `/admin/classes/department/${departmentId}`
      const res = await api.get<Class[]>(url)
      return res.data
    },
  })

  return (
    <div>
      <button
        onClick={() => navigate(`/admin/departments/${departmentId}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Department
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Classes - {department?.name}
          </h1>
          <p className="text-gray-600 mt-2">Manage classes in this department</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Class
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No classes found. Click &quot;Add Class&quot; to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls: Class) => (
            <div
              key={cls.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow relative group"
            >
              {/* Timetable Icon Button - Top Right */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  void navigate(`/admin/classes/${cls.id}/timetable`)
                }}
                className="absolute top-4 right-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10"
                title="View Timetable"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {/* Card Content - Clickable to view students */}
              <div
                onClick={() => navigate(`/admin/classes/${cls.id}/students`)}
                className="p-6 cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 pr-10">{cls.name}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Semester: {cls.semester}</p>
                  <p>Year: {cls.year}</p>
                  <p className="text-blue-600 mt-3">• Click to view students</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddClassModal
          departmentId={departmentId ?? ''}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            void queryClient.invalidateQueries({ queryKey: ['classes'] })
          }}
        />
      )}
    </div>
  )
}

function AddClassModal({
  departmentId,
  onClose,
  onSuccess,
}: {
  departmentId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    semester: 1,
    year: new Date().getFullYear(),
    departmentId: Number(departmentId),
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post<Class>('/admin/classes', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Class added successfully!')
      onSuccess()
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to add class')
    },
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Class</h2>
        <form onSubmit={(e) => { e.preventDefault(); void mutation.mutate(formData) }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CS-A, Mechanical-B"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <input
              type="number"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {mutation.isPending ? 'Adding...' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
