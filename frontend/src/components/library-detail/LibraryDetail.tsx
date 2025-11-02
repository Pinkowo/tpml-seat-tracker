import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { LibraryWithSeat } from '@/types/library';

interface LibraryDetailProps {
  open: boolean;
  library: LibraryWithSeat | null;
  onClose: () => void;
}

const getSeatText = (available?: number, total?: number) => {
  if (available === undefined || total === undefined) {
    return { label: '資料更新中', description: '目前尚無即時座位資訊' };
  }

  if (available === 0) {
    return { label: '座位已滿', description: '建議稍後再試，或查看其他圖書館。' };
  }

  return {
    label: `${available} / ${total}`,
    description: '目前可用座位數 / 全部座位數'
  };
};

const getSeatColor = (available?: number) => {
  if (available === undefined) {
    return 'text-seat-unknown-border';
  }

  return available === 0 ? 'text-seat-full' : 'text-seat-available';
};

export const LibraryDetail = ({ open, library, onClose }: LibraryDetailProps) => {
  const modalRoot = typeof document === 'undefined' ? null : document.body;

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open || !library || !modalRoot) {
    return null;
  }

  const { seatStatus } = library;
  const seatText = getSeatText(seatStatus?.available_seats, seatStatus?.total_seats);
  const seatColor = getSeatColor(seatStatus?.available_seats);
  const lastUpdated = seatStatus?.updated_at
    ? new Date(seatStatus.updated_at).toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : undefined;

  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${library.latitude},${library.longitude}`;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-detail-title"
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative h-[85vh] w-full max-w-lg overflow-hidden rounded-t-3xl bg-white sm:h-auto sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-primary px-6 pb-12 pt-10 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="關閉詳細資訊"
          >
            ×
          </button>
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">Library</p>
          <h2 id="library-detail-title" className="mt-2 text-3xl font-semibold">
            {library.name}
          </h2>
          <p className="mt-2 text-sm text-white/80">{library.address}</p>
        </div>

        <div className="-mt-12 space-y-6 rounded-t-3xl bg-white px-6 pb-8 pt-6">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">目前座位狀態</p>
            <p className={clsx('mt-3 text-5xl font-bold', seatColor)}>{seatText.label}</p>
            <p className="mt-2 text-sm text-gray-500">{seatText.description}</p>
            {lastUpdated && <p className="mt-3 text-xs text-gray-400">更新時間：{lastUpdated}</p>}
          </div>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-500">距離</h3>
              <p className="mt-1 text-base">
                {library.distance ? `${(library.distance / 1000).toFixed(1)} 公里` : '距離資訊取得中'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500">圖書館資訊</h3>
              <p className="mt-1 text-base leading-relaxed">{library.address}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-6 py-5">
          <a
            href={navigationUrl}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            開啟導航
          </a>
        </div>
      </div>
    </div>
  );

  return createPortal(content, modalRoot);
};
