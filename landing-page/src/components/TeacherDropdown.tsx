import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
}

interface TeacherDropdownProps {
  onSelect: (teacher: Teacher) => void;
  selectedTeacherId?: number;
  selectedTeacherName?: string;
  teachers: Teacher[];
}

export function TeacherDropdown({
  onSelect,
  selectedTeacherId,
  selectedTeacherName,
  teachers,
}: TeacherDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (teacher: Teacher) => {
    onSelect(teacher);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect({ id: 0, name: '' });
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left focus:border-blue-500 focus:outline-none"
      >
        <div className="flex items-center justify-between">
          <span className={selectedTeacherName ? 'text-gray-900' : 'text-gray-400'}>
            {selectedTeacherName || 'Select a teacher...'}
          </span>
          <div className="flex items-center gap-1">
            {selectedTeacherId && selectedTeacherId > 0 && (
              <X className="h-4 w-4 text-gray-500 hover:text-red-600" onClick={handleClear} />
            )}
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachers..."
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredTeachers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No teachers found</div>
            ) : (
              filteredTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleSelect(teacher)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 ${
                    selectedTeacherId === teacher.id
                      ? 'bg-blue-50 font-medium text-blue-600'
                      : 'text-gray-900'
                  }`}
                >
                  {teacher.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
