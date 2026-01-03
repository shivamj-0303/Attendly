import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Modal } from '@/components';
import type { ErrorResponse } from '@/types';

interface Class {
  departmentId: number;
  id: number;
  isActive: boolean;
  name: string;
  semester: number;
  year: number;
}

interface AddClassFormData {
  departmentId: number;
  name: string;
  semester: number;
  year: number;
}

interface AddClassModalProps {
  departmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function AddClassModal({ departmentId, isOpen, onClose }: AddClassModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AddClassFormData>({
    departmentId: Number(departmentId),
    name: '',
    semester: 1,
    year: new Date().getFullYear(),
  });

  const mutation = useMutation({
    mutationFn: async (data: AddClassFormData) => {
      const res = await api.post<Class>('/admin/classes', data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Failed to add class');
    },
    onSuccess: () => {
      toast.success('Class added successfully!');
      void queryClient.invalidateQueries({ queryKey: ['classes'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: keyof AddClassFormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Class"
      footer={
        <>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e?.preventDefault();
              const formEvent = new Event('submit', { bubbles: true, cancelable: true });
              handleSubmit(formEvent as unknown as React.FormEvent);
            }}
            variant="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Adding...' : 'Add Class'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., CS-A, Mechanical-B"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.semester}
            onChange={(e) => handleChange('semester', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            value={formData.year}
            onChange={(e) => handleChange('year', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
}
