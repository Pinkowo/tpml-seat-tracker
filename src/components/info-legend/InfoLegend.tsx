import { useState } from 'react';

interface InfoLegendProps {
  lastUpdated?: string;
}

const legendItems = [
  { label: '有空位', colorClass: 'bg-seat-available' },
  { label: '座位不足', colorClass: 'bg-secondary' },
  { label: '座位已滿', colorClass: 'bg-seat-full' },
  { label: '尚無資料', colorClass: 'bg-seat-unknown border border-seat-unknown-border' },
];

const formatLastUpdated = (isoString?: string) => {
  if (!isoString) {
    return '尚無更新時間';
  }

  const date = new Date(isoString);
  return `最後更新：${date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const InfoLegend = ({ lastUpdated }: InfoLegendProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative inline-block min-h-[44px] min-w-[44px] pointer-events-auto">
      <button
        type="button"
        aria-label="開啟座位狀態說明"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className={`absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isOpen
            ? 'pointer-events-none -translate-y-1 scale-75 opacity-0'
            : 'translate-y-0 scale-100 opacity-100'
        }`}
      >
        <span aria-hidden="true" className="text-base font-semibold">
          i
        </span>
      </button>

      <div
        className={`absolute right-0 top-0 z-10 w-40 origin-top-right overflow-hidden rounded-3xl bg-white/80 text-sm text-gray-700 shadow-lg backdrop-blur transition-all duration-300 ease-out ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-90 opacity-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="font-semibold">座位狀態說明</span>
          <button
            type="button"
            aria-label="收合座位狀態說明"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-gray-700 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span aria-hidden="true" className="text-base leading-none">
              -
            </span>
          </button>
        </div>
        <div className="space-y-2 px-4 pb-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full ${item.colorClass}`}
              >
                <span className="sr-only">{item.label}</span>
              </span>
              <span>{item.label}</span>
            </div>
          ))}
          <p className="pt-1 text-xs text-gray-500">{formatLastUpdated(lastUpdated)}</p>
        </div>
      </div>
    </div>
  );
};
