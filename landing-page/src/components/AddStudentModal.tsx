import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button, Modal } from '@/components';
import type { Student } from '@/types';

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
  const formRef = useRef<HTMLFormElement>(null);

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
    onError: (error: any) => {
      const message = error?.userMessage || error?.message || 'Failed to add student';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Student added successfully!');
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      // Reset form
      setFormData({
        classId: Number(classId),
        departmentId,
        email: '',
        name: '',
        phone: '',
        registrationNumber: '',
        rollNumber: '',
      });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Phone is required');
      return;
    }
    
    // Create clean payload (remove empty optional fields)
    const payload: any = {
      classId: formData.classId,
      departmentId: formData.departmentId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };
    
    // Only add optional fields if they have values
    if (formData.rollNumber?.trim()) {
      payload.rollNumber = formData.rollNumber.trim();
    }
    if (formData.registrationNumber?.trim()) {
      payload.registrationNumber = formData.registrationNumber.trim();
    }
    
    mutation.mutate(payload);
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
              // Trigger form validation by dispatching submit event
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }}
            variant="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Adding...' : 'Add Student'}
          </Button>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
          <input
            type="text"
            value={formData.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty for auto-generation"
          />
          <p className="text-xs text-gray-500 mt-1">
            If left empty, roll number will be auto-generated sequentially
          </p>
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
                A secure temporary password will be automatically generated and sent to the
                student&apos;s email. The student will be required to change it on first login.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
          <input
            type="tel"
            required
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
