import type { TimetableSlot } from '../types';

interface TimetableSlotCellProps {
  onEdit: (e: React.MouseEvent) => void;
  slot: TimetableSlot;
}

export const TimetableSlotCell = ({ onEdit, slot }: TimetableSlotCellProps) => {
  return (
    <div
      onClick={onEdit}
      className="group relative h-full cursor-pointer rounded-md border border-blue-200 bg-blue-50 p-2 transition-colors hover:border-blue-400 hover:bg-blue-100"
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{slot.subject}</h4>
          <p className="mt-1 text-xs text-gray-600">{slot.teacherName}</p>
          {slot.room && <p className="mt-0.5 text-xs text-gray-500">Room: {slot.room}</p>}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
          </span>
          <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
