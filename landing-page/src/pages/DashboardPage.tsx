import { useAuthStore } from '@/store/authStore'
import { Users, Calendar, BookOpen, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const stats = [
    { name: 'Total Students', value: '0', icon: Users, color: 'bg-blue-500' },
    { name: 'Total Classes', value: '0', icon: Calendar, color: 'bg-green-500' },
    { name: 'Total Courses', value: '0', icon: BookOpen, color: 'bg-purple-500' },
    { name: 'Attendance Rate', value: '0%', icon: TrendingUp, color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <p className="text-gray-600">
          This is your admin dashboard. You can manage students, classes, and attendance from here.
          More features will be added soon.
        </p>
      </div>
    </div>
  )
}
