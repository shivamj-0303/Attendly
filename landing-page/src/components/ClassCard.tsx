import { Clock } from 'lucide-react';
import type { TimetableSlot } from '../types';

interface ClassCardProps {
  slot: TimetableSlot;
  onClick?: () => void;
  showMarkButton?: boolean;
}

export const ClassCard = ({ slot, onClick, showMarkButton }: ClassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 border-transparent bg-white p-4 shadow transition-all ${
        onClick ? 'cursor-pointer hover:border-green-500 hover:shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{slot.subject}</h3>
          <p className="mt-1 text-sm text-gray-600">
            📚 {slot.className || `Class ${slot.classId}`}
          </p>
          <p className="text-sm text-gray-600">🚪 Room: {slot.room || 'TBA'}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
        </div>
        {showMarkButton && (
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Mark Attendance
          </div>
        )}
      </div>
    </div>
  );
};
