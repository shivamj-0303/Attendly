import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronLeft, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { AddStudentModal, StudentTable } from '@/components';
import type { ErrorResponse, Student } from '@/types';
import type { Class } from '@/types/department';

export default function StudentsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: classData } = useQuery<Class>({
    enabled: !!classId,
    queryFn: async () => {
      const res = await api.get<Class>(`/admin/classes/${classId}`);
      return res.data;
    },
    queryKey: ['class', classId],
  });

  const { data: students = [], isLoading } = useQuery<Student[]>({
    enabled: !!classId,
    queryFn: async () => {
      const url = searchQuery
        ? `/admin/students/search?q=${encodeURIComponent(searchQuery)}&classId=${classId}`
        : `/admin/students/class/${classId}`;
      const res = await api.get<Student[]>(url);
      return res.data;
    },
    queryKey: ['students', classId, searchQuery],
  });

  const deleteMutation = useMutation({
    mutationFn: async (studentId: number) => {
      await api.delete(`/admin/students/${studentId}`);
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Failed to delete student');
    },
    onSuccess: () => {
      toast.success('Student deleted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleDelete = (studentId: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(studentId);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students - {classData?.name}</h1>
          <p className="text-gray-600 mt-2">Manage students in this class</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/admin/classes/${classId}/timetable`)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Timetable
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <StudentTable isLoading={isLoading} onDelete={handleDelete} students={students} />

      {showAddModal && classData && (
        <AddStudentModal
          classId={classId ?? ''}
          departmentId={classData.departmentId}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
