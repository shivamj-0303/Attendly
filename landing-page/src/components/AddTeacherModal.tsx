import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Modal } from '@/components';
import type { ErrorResponse, Teacher } from '@/types';

interface AddTeacherFormData {
  departmentId: number;
  email: string;
  name: string;
  password?: string; // Optional - server will generate if not provided
  phone: string;
}

interface AddTeacherModalProps {
  departmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddTeacherModal({ departmentId, isOpen, onClose }: AddTeacherModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AddTeacherFormData>({
    departmentId: Number(departmentId),
    email: '',
    name: '',
    // password is optional - server will generate it
    phone: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: AddTeacherFormData) => {
      const res = await api.post<Teacher>('/admin/teachers', data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Failed to add teacher');
    },
    onSuccess: () => {
      toast.success('Teacher added successfully!');
      void queryClient.invalidateQueries({ queryKey: ['teachers'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: keyof AddTeacherFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Teacher"
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
            {mutation.isPending ? 'Adding...' : 'Add Teacher'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Info about auto-generated password */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <span className="text-blue-600 text-lg mr-2">ℹ️</span>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">Auto-Generated Password</p>
              <p className="text-xs text-blue-700 mt-1">
                A secure temporary password will be automatically generated and sent to the
                teacher&apos;s email. The teacher will be required to change it on first login.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
}
