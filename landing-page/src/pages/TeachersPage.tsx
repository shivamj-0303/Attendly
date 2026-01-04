import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AddTeacherModal, TeacherTable } from '@/components';
import type { ErrorResponse, Teacher } from '@/types';
import type { Department } from '@/types/department';

export default function TeachersPage() {
  const { id: departmentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: department } = useQuery<Department>({
    enabled: !!departmentId,
    queryFn: async () => {
      const res = await api.get<Department>(`/admin/departments/${departmentId}`);
      return res.data;
    },
    queryKey: ['department', departmentId],
  });

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    enabled: !!departmentId,
    queryFn: async () => {
      const url = searchQuery
        ? `/admin/teachers/search?q=${encodeURIComponent(searchQuery)}&departmentId=${departmentId}`
        : `/admin/teachers/department/${departmentId}`;
      const res = await api.get<Teacher[]>(url);
      return res.data;
    },
    queryKey: ['teachers', departmentId, searchQuery],
  });

  const deleteMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      await api.delete(`/admin/teachers/${teacherId}`);
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Failed to delete teacher');
    },
    onSuccess: () => {
      toast.success('Teacher deleted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const handleDelete = (teacherId: number) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      deleteMutation.mutate(teacherId);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Teachers - {department?.name}</h1>
          <p className="text-gray-600 mt-2">Manage teachers in this department</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Teacher
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <TeacherTable isLoading={isLoading} onDelete={handleDelete} teachers={teachers} />

      {showAddModal && (
        <AddTeacherModal
          departmentId={departmentId ?? ''}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
