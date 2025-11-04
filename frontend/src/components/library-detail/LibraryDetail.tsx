import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import type { LibraryWithSeat } from '@/types/library';
import { OpeningHours } from './OpeningHours';
import { ClosingWarning } from './ClosingWarning';
import { PredictionSection } from './PredictionSection';
import { usePredictions } from '@/hooks/usePredictions';

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
    description: '目前可用座位數 / 全部座位數',
  };
};

export const LibraryDetail = ({ open, library, onClose }: LibraryDetailProps) => {
  const modalRoot = typeof document === 'undefined' ? null : document.body;
  const predictionsQuery = usePredictions(library?.name ?? null, open);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab' && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        } else if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    previouslyFocusedElement.current = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocusedElement.current instanceof HTMLElement) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open || !library || !modalRoot) {
    return null;
  }

  const { seatStatus } = library;
  const seatText = getSeatText(seatStatus?.available_seats, seatStatus?.total_seats);
  const operatingHours = library.operatingHours;
  const isOpen = operatingHours?.isOpen ?? true;
  const seatColor = !isOpen
    ? 'text-[#ADB8BE]'
    : seatStatus?.available_seats === undefined
      ? 'text-seat-unknown-border'
      : seatStatus.available_seats === 0
        ? 'text-seat-full'
        : 'text-seat-available';
  const lastUpdated = seatStatus?.updated_at
    ? new Date(seatStatus.updated_at).toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : undefined;

  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${library.latitude},${library.longitude}`;

  const handleNavigate = () => {
    if (!isOpen) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.open(navigationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-detail-title"
      className="fixed inset-0 z-30 bg-black/60"
      onClick={onClose}
    >
      <div
        ref={modalContainerRef}
        className="relative flex h-full w-full flex-col bg-white focus:outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          <div
            className={clsx('relative px-6 pb-12 pt-10', {
              'bg-primary text-white': isOpen,
              'bg-[#E3E7E9] text-gray-600': !isOpen,
            })}
          >
            <button
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
              className={clsx(
                'absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition focus:outline-none focus-visible:ring-2',
                {
                  'bg-white/20 hover:bg-white/30 focus-visible:ring-white': isOpen,
                  'bg-white/50 text-gray-700 hover:bg-white/70 focus-visible:ring-gray-400':
                    !isOpen,
                }
              )}
              aria-label="關閉詳細資訊"
            >
              ×
            </button>
            <p
              className={clsx('text-sm uppercase tracking-[0.2em]', {
                'text-white/80': isOpen,
                'text-gray-500': !isOpen,
              })}
            >
              Library
            </p>
            <h2 id="library-detail-title" className="mt-2 text-3xl font-semibold">
              {library.name}
            </h2>
            <p
              className={clsx('mt-2 text-sm', {
                'text-white/80': isOpen,
                'text-gray-500': !isOpen,
              })}
            >
              {library.address}
            </p>
          </div>

          <div className="-mt-12 space-y-6 rounded-t-3xl bg-white px-6 pb-8 pt-6">
            <div
              className={clsx('rounded-2xl p-6 shadow-card', {
                'bg-white text-gray-700': isOpen,
                'bg-[#E3E7E9] text-gray-500': !isOpen,
              })}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">目前座位狀態</p>
              <p className={clsx('mt-3 text-5xl font-bold', seatColor)}>{seatText.label}</p>
              <p className="mt-2 text-sm text-gray-500">{seatText.description}</p>
              {lastUpdated && <p className="mt-3 text-xs text-gray-400">更新時間：{lastUpdated}</p>}
            </div>

            <OpeningHours operatingHours={operatingHours} isOpen={isOpen} />
            <ClosingWarning closingInMinutes={operatingHours?.closesInMinutes ?? null} />
            <PredictionSection
              data={predictionsQuery.data}
              isLoading={predictionsQuery.isLoading}
              isError={predictionsQuery.isError}
              onRetry={() => predictionsQuery.refetch()}
            />

            <div className={clsx('space-y-4', isOpen ? 'text-gray-700' : 'text-gray-500')}>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">距離</h3>
                <p className="mt-1 text-base">
                  {library.distance
                    ? `${(library.distance / 1000).toFixed(1)} 公里`
                    : '距離資訊取得中'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500">圖書館資訊</h3>
                <p className="mt-1 text-base leading-relaxed">{library.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white px-6 py-5">
          <button
            type="button"
            onClick={handleNavigate}
            disabled={!isOpen}
            aria-disabled={!isOpen}
            className={clsx(
              'flex w-full items-center justify-center rounded-xl px-4 py-3 text-base font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition',
              isOpen
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'cursor-not-allowed bg-gray-200 text-gray-500'
            )}
          >
            {isOpen ? '開啟導航' : '目前非營業時間'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, modalRoot);
};
