interface DayTabsProps {
  days: string[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
}

export const DayTabs = ({ days, selectedDay, onSelectDay }: DayTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day, index) => (
        <button
          key={day}
          onClick={() => onSelectDay(index)}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
            selectedDay === index
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      ))}
    </div>
  );
};
