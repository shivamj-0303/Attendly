import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Modal } from '@/components';
import type { ErrorResponse, Student } from '@/types';

interface AddStudentFormData {
  classId: number;
  departmentId: number;
  email: string;
  name: string;
  password?: string; // Optional - server will generate if not provided
  phone: string;
  registrationNumber: string;
  rollNumber: string;
}

interface AddStudentModalProps {
  classId: string;
  departmentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AddStudentModal({ classId, departmentId, isOpen, onClose }: AddStudentModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<AddStudentFormData>({
    classId: Number(classId),
    departmentId,
    email: '',
    name: '',
    // password is optional - server will generate it
    phone: '',
    registrationNumber: '',
    rollNumber: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: AddStudentFormData) => {
      const res = await api.post<Student>('/admin/students', data);
      return res.data;
    },
    onError: (error: ErrorResponse) => {
      toast.error(error.message ?? 'Failed to add student');
    },
    onSuccess: () => {
      toast.success('Student added successfully!');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (field: keyof AddStudentFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student"
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
            {mutation.isPending ? 'Adding...' : 'Add Student'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Roll Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
                A secure temporary password will be automatically generated and sent to the student's email. 
                The student will be required to change it on first login.
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
            placeholder="10-digit phone number"
            maxLength={10}
            pattern="[0-9]{10}"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registration Number
          </label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => handleChange('registrationNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </Modal>
  );
}
