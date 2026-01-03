import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TimetableSlot } from '@/types';
import { LoadingSpinner } from '@/components';
import { TimetableSlotCell } from '@/components/TimetableSlotCell';
import { TimetableSlotModal } from '@/components/TimetableSlotModal';

interface Class {
  id: number;
  name: string;
  semester: number;
  year: number;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
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

export default function TimetablePage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const { data: classData } = useQuery<Class>({
    enabled: !!classId,
    queryFn: async () => {
      const res = await api.get<Class>(`/admin/classes/${classId}`);
      return res.data;
    },
    queryKey: ['class', classId],
  });

  const { data: timetableSlots = [], isLoading } = useQuery<TimetableSlot[]>({
    enabled: !!classId,
    queryFn: async () => {
      const res = await api.get<TimetableSlot[]>(`/admin/timetable/class/${classId}`);
      return res.data;
    },
    queryKey: ['timetable', classId],
  });

  const getSlotAtTime = (day: string, time: string): TimetableSlot | undefined => {
    return timetableSlots.find((slot) => {
      const slotStart = slot.startTime.substring(0, 5);
      const slotEnd = slot.endTime.substring(0, 5);
      return slot.dayOfWeek === day && slotStart <= time && slotEnd > time && slot.isActive;
    });
  };

  const getSlotSpan = (slot: TimetableSlot): number => {
    const slotStart = slot.startTime.substring(0, 5);
    const slotEnd = slot.endTime.substring(0, 5);
    const startIndex = TIMES.indexOf(slotStart);
    const endIndex = TIMES.indexOf(slotEnd);
    if (startIndex === -1 || endIndex === -1) return 1;
    return endIndex - startIndex;
  };

  const shouldRenderSlot = (slot: TimetableSlot, time: string): boolean => {
    const slotStart = slot.startTime.substring(0, 5);
    return slotStart === time;
  };

  const handleCellClick = (day: string, time: string) => {
    const existingSlot = timetableSlots.find((slot) => {
      const slotStart = slot.startTime.substring(0, 5);
      const slotEnd = slot.endTime.substring(0, 5);
      return slot.dayOfWeek === day && slotStart <= time && slotEnd > time;
    });

    if (existingSlot) {
      setSelectedSlot(existingSlot);
      setSelectedDay(null);
      setSelectedTime(null);
    } else {
      setSelectedSlot(null);
      setSelectedDay(day);
      setSelectedTime(time);
    }
    setShowSlotModal(true);
  };

  const handleEdit = (slot: TimetableSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSlot(slot);
    setSelectedDay(null);
    setSelectedTime(null);
    setShowSlotModal(true);
  };

  const handleCloseModal = () => {
    setShowSlotModal(false);
    setSelectedSlot(null);
    setSelectedDay(null);
    setSelectedTime(null);
  };

  if (!classId) {
    return <div className="pb-8">Invalid class ID</div>;
  }

  if (isLoading) {
    return <LoadingSpinner text="Loading timetable..." />;
  }

  return (
    <div className="pb-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="h-5 w-5" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Timetable - {classData?.name}</h1>
        <p className="mt-2 text-gray-600">Click on any time slot to add or edit schedule</p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 border-b bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="min-w-[150px] border-b px-4 py-3 text-center text-sm font-semibold text-gray-700"
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time} className="border-b hover:bg-gray-50">
                  <td className="sticky left-0 z-10 border-r bg-white px-4 py-2 text-sm font-medium text-gray-600">
                    {time}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlotAtTime(day, time);
                    const shouldRender = slot && shouldRenderSlot(slot, time);
                    const span = slot ? getSlotSpan(slot) : 1;

                    if (slot && !shouldRender) {
                      return null;
                    }

                    return (
                      <td
                        key={`${day}-${time}`}
                        rowSpan={shouldRender ? span : 1}
                        onClick={() => !slot && handleCellClick(day, time)}
                        className={`border-r p-2 ${
                          slot ? '' : 'cursor-pointer transition-colors hover:bg-gray-100'
                        }`}
                      >
                        {slot && (
                          <TimetableSlotCell slot={slot} onEdit={(e) => handleEdit(slot, e)} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSlotModal && (
        <TimetableSlotModal
          classId={classId}
          isOpen={showSlotModal}
          onClose={handleCloseModal}
          selectedDay={selectedDay}
          selectedSlot={selectedSlot}
          selectedTime={selectedTime}
        />
      )}
    </div>
  );
}
