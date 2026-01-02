import { Calendar } from 'lucide-react';

interface Class {
  id: number;
  isActive: boolean;
  name: string;
  semester: number;
  year: number;
}

interface ClassGridProps {
  classes: Class[];
  isLoading: boolean;
  onClassClick: (classId: number) => void;
  onTimetableClick: (classId: number, e: React.MouseEvent) => void;
}

export function ClassGrid({ classes, isLoading, onClassClick, onTimetableClick }: ClassGridProps) {
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (classes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">
          No classes found. Click &quot;Add Class&quot; to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((cls) => (
        <div
          key={cls.id}
          className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow relative group"
        >
          <button
            onClick={(e) => onTimetableClick(cls.id, e)}
            className="absolute top-4 right-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors z-10"
            title="View Timetable"
          >
            <Calendar className="w-5 h-5" />
          </button>

          <div onClick={() => onClassClick(cls.id)} className="p-6 cursor-pointer">
            <h3 className="text-xl font-bold text-gray-900 mb-2 pr-10">{cls.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Semester: {cls.semester}</p>
              <p>Year: {cls.year}</p>
              <p className="text-blue-600 mt-3">• Click to view students</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
