import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import type { ErrorResponse, Teacher, TimetableSlot } from '@/types';
import { Button, Modal, TeacherDropdown } from '@/components';

interface SlotFormData {
  dayOfWeek: string;
  endTime: string;
  notes: string;
  room: string;
  startTime: string;
  subject: string;
  teacherId: number;
  teacherName: string;
}

interface TimetableSlotModalProps {
  classId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedDay: string | null;
  selectedSlot: TimetableSlot | null;
  selectedTime: string | null;
}

const TIMES = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

export const TimetableSlotModal = ({
  classId,
  isOpen,
  onClose,
  selectedDay,
  selectedSlot,
  selectedTime,
}: TimetableSlotModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!selectedSlot;

  const [formData, setFormData] = useState<SlotFormData>({
    dayOfWeek: selectedSlot?.dayOfWeek || selectedDay || 'MONDAY',
    endTime: selectedSlot?.endTime.substring(0, 5) || '09:00',
    notes: selectedSlot?.notes || '',
    room: selectedSlot?.room || '',
    startTime: selectedSlot?.startTime.substring(0, 5) || selectedTime || '08:00',
    subject: selectedSlot?.subject || '',
    teacherId: selectedSlot?.teacherId || 0,
    teacherName: selectedSlot?.teacherName || '',
  });

  // Fetch teachers list
  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryFn: async () => {
      const res = await api.get<Teacher[]>('/admin/teachers');
      return res.data;
    },
    queryKey: ['teachers'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: SlotFormData) => {
      await api.post('/admin/timetable', {
        ...data,
        classId: parseInt(classId),
        teacherId: data.teacherId,
      });
    },
    onError: (error: { response?: { data?: ErrorResponse } }) => {
      toast.error(error.response?.data?.message || 'Failed to create slot');
    },
    onSuccess: () => {
      toast.success('Timetable slot created successfully!');
      void queryClient.invalidateQueries({ queryKey: ['timetable'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SlotFormData) => {
      await api.put(`/admin/timetable/${selectedSlot?.id}`, {
        ...data,
        classId: parseInt(classId),
        teacherId: data.teacherId,
      });
    },
    onError: (error: { response?: { data?: ErrorResponse } }) => {
      toast.error(error.response?.data?.message || 'Failed to update slot');
    },
    onSuccess: () => {
      toast.success('Timetable slot updated successfully!');
      void queryClient.invalidateQueries({ queryKey: ['timetable'] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/admin/timetable/${selectedSlot?.id}`);
    },
    onError: (error: { response?: { data?: ErrorResponse } }) => {
      toast.error(error.response?.data?.message || 'Failed to delete slot');
    },
    onSuccess: () => {
      toast.success('Timetable slot deleted successfully!');
      void queryClient.invalidateQueries({ queryKey: ['timetable'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.subject ||
      !formData.teacherName ||
      !formData.teacherId ||
      formData.teacherId === 0
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      deleteMutation.mutate();
    }
  };

  const handleChange = (field: keyof SlotFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
      size="lg"
      footer={
        <div className="flex justify-between gap-3">
          {isEditing && (
            <Button onClick={handleDelete} variant="danger" disabled={deleteMutation.isPending}>
              Delete
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-3">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                const event = new Event('submit') as unknown as React.FormEvent;
                handleSubmit(event);
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Day <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => handleChange('dayOfWeek', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            >
              {TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              required
            >
              {TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teacher <span className="text-red-500">*</span>
            </label>
            <TeacherDropdown
              teachers={teachers}
              selectedTeacherId={formData.teacherId}
              selectedTeacherName={formData.teacherName}
              onSelect={(teacher) => {
                setFormData((prev) => ({
                  ...prev,
                  teacherId: teacher.id,
                  teacherName: teacher.name,
                }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
};
