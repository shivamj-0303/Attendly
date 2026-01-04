import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import { AddClassModal, ClassGrid } from '@/components';
import type { Department, Class } from '@/types/department';

export default function ClassesPage() {
  const { id: departmentId } = useParams();
  const navigate = useNavigate();

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

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    enabled: !!departmentId,
    queryFn: async () => {
      const url = searchQuery
        ? `/admin/classes/search?q=${encodeURIComponent(searchQuery)}&departmentId=${departmentId}`
        : `/admin/classes/department/${departmentId}`;
      const res = await api.get<Class[]>(url);
      return res.data;
    },
    queryKey: ['classes', departmentId, searchQuery],
  });

  const handleClassClick = (classId: number) => {
    void navigate(`/admin/classes/${classId}/students`);
  };

  const handleTimetableClick = (classId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    void navigate(`/admin/classes/${classId}/timetable`);
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
          <h1 className="text-3xl font-bold text-gray-900">Classes - {department?.name}</h1>
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

      <ClassGrid
        classes={classes}
        isLoading={isLoading}
        onClassClick={handleClassClick}
        onTimetableClick={handleTimetableClick}
      />

      {showAddModal && (
        <AddClassModal
          departmentId={departmentId ?? ''}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
