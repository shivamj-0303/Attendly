import { useAuthStore } from '@/store/authStore'
import { Building2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/admin/departments')
      return res.data
    },
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get('/admin/teachers')
      return res.data
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manage Departments Card */}
        <button
          onClick={() => navigate('/admin/departments')}
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-4 rounded-lg group-hover:bg-blue-600 transition-colors">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{departments.length}</p>
              <p className="text-sm text-gray-500">Departments</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Departments</h2>
          <p className="text-gray-600">
            Add, edit, and manage departments like CS, Mechanical, etc.
          </p>
        </button>

        {/* Manage Staff Card */}
        <button
          onClick={() => navigate('/admin/staff')}
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-4 rounded-lg group-hover:bg-green-600 transition-colors">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{teachers.length}</p>
              <p className="text-sm text-gray-500">Staff Members</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Staff</h2>
          <p className="text-gray-600">
            View and manage all teachers across all departments
          </p>
        </button>
      </div>
    </div>
  )
}
