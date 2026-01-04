import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Users, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import type { Department, Class } from '@/types/department';
import type { Teacher } from '@/types/teacher';

export default function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: department, isLoading } = useQuery<Department>({
    queryKey: ['department', id],
    queryFn: async () => {
      const res = await api.get<Department>(`/admin/departments/${id}`);
      return res.data;
    },
  });

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ['department-teachers', id],
    queryFn: async () => {
      const res = await api.get<Teacher[]>(`/admin/teachers/department/${id}`);
      return res.data;
    },
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['department-classes', id],
    queryFn: async () => {
      const res = await api.get<Class[]>(`/admin/classes/department/${id}`);
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!department) {
    return <div className="text-center py-12">Department not found</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/admin/departments')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Departments
      </button>

      {/* Department Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
            <p className="text-gray-600 mt-2">Code: {department.code}</p>
            {department.description && (
              <p className="text-gray-600 mt-2">{department.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manage Teachers */}
        <button
          onClick={() => navigate(`/admin/departments/${id}/teachers`)}
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-4 rounded-lg group-hover:bg-purple-600 transition-colors">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{teachers.length}</p>
              <p className="text-sm text-gray-500">Teachers</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Teachers</h2>
          <p className="text-gray-600">View and manage all teachers in this department</p>
        </button>

        {/* Manage Classes */}
        <button
          onClick={() => navigate(`/admin/departments/${id}/classes`)}
          className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-4 rounded-lg group-hover:bg-orange-600 transition-colors">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{classes.length}</p>
              <p className="text-sm text-gray-500">Classes</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manage Classes</h2>
          <p className="text-gray-600">View and manage all classes in this department</p>
        </button>
      </div>
    </div>
  );
}
