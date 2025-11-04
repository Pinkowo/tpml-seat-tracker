import type { LibraryWithSeat } from '@/types/library';
import { formatDistance } from '@/utils/format';

interface LibrarySummaryCardProps {
  library: LibraryWithSeat;
  onViewDetail: () => void;
  onClose: () => void;
}

const formatOperatingHours = (library: LibraryWithSeat) => {
  const hours = library.operatingHours;
  if (!hours) {
    return '營業資訊取得中';
  }

  if (hours.isOpen) {
    return `${hours.openTime} - ${hours.closeTime}`;
  }

  if (hours.nextOpenTime) {
    return `目前休館，下次開放：${hours.nextOpenTime}`;
  }

  return '目前休館';
};

export const LibrarySummaryCard = ({ library, onViewDetail, onClose }: LibrarySummaryCardProps) => {
  const seatStatus = library.seatStatus;
  const seatsLabel = seatStatus ? `${seatStatus.available_seats ?? '-'} / ${seatStatus.total_seats ?? '-'}` : '—';
  const distanceLabel = library.distance ? formatDistance(library.distance) : '距離計算中';

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4">
      <div className="pointer-events-auto rounded-3xl bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{library.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{formatOperatingHours(library)}</p>
          </div>
          <button
            type="button"
            aria-label="關閉圖書館簡介"
            onClick={onClose}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            關閉
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">剩餘座位</span>
            <span>{seatsLabel}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-semibold text-gray-800">距離</span>
            <span>{distanceLabel}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewDetail}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          查看詳情
        </button>
      </div>
    </div>
  );
};
