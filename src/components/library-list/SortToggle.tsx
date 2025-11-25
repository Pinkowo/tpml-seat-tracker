interface SortToggleProps {
  value: 'distance' | 'seats';
  onChange: (value: 'distance' | 'seats') => void;
}

const options: Array<{ value: 'distance' | 'seats'; label: string }> = [
  { value: 'distance', label: '依距離' },
  { value: 'seats', label: '依可用座位' }
];

export const SortToggle = ({ value, onChange }: SortToggleProps) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white p-1 text-sm text-primary shadow-sm">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-w-[96px] rounded-full px-4 py-2 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
              isActive ? 'bg-primary text-white shadow' : 'bg-transparent text-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
