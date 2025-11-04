import clsx from 'clsx';
import type { LibraryWithSeat } from '@/types/library';
import { formatDistance } from '@/utils/format';

interface LibraryCardProps {
  library: LibraryWithSeat;
  isActive: boolean;
  onSelect: (libraryId: number) => void;
}

const getSeatStatus = (available?: number) => {
  if (available === undefined) {
    return {
      label: '資料更新中',
      badgeClass: 'bg-gray-100 text-gray-400',
      valueClass: 'text-seat-unknown-border'
    };
  }

  if (available === 0) {
    return {
      label: '座位已滿',
      badgeClass: 'bg-gray-100 text-gray-400',
      valueClass: 'text-seat-full'
    };
  }

  if (available <= 5) {
    return {
      label: '座位不足',
      badgeClass: 'bg-gray-100 text-secondary',
      valueClass: 'text-secondary'
    };
  }

  return {
    label: '有空位',
    badgeClass: 'bg-[rgba(118,167,50,0.1)] text-seat-available',
    valueClass: 'text-seat-available'
  };
};

export const LibraryCard = ({ library, isActive, onSelect }: LibraryCardProps) => {
  const availableSeats = library.seatStatus?.available_seats;
  const totalSeats = library.seatStatus?.total_seats;
  const { label, badgeClass, valueClass } = getSeatStatus(availableSeats);

  return (
    <button
      type="button"
      onClick={() => onSelect(library.id)}
      className={clsx(
        'w-full rounded-2xl border border-transparent bg-white p-5 text-left shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        {
          'scale-[0.99] border-primary/40 bg-primary/5 shadow-md': isActive,
          'hover:bg-gray-50': !isActive
        }
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{library.name}</h3>
        <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', badgeClass)}>{label}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{library.address}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className={clsx('text-3xl font-bold', valueClass)}>
            {availableSeats !== undefined ? availableSeats : '--'}
            <span className="ml-1 text-base font-medium text-gray-400">
              / {totalSeats ?? '--'}
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-400">可用座位 / 總座位</p>
        </div>
        <p className="text-sm text-gray-500">{formatDistance(library.distance ?? null)}</p>
      </div>
    </button>
  );
};
