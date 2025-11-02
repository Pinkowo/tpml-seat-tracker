interface InfoFooterProps {
  lastUpdated?: string;
}

const legendItems = [
  { label: '有空位', colorClass: 'bg-seat-available border-seat-available text-white' },
  { label: '座位已滿', colorClass: 'bg-seat-full text-white' },
  {
    label: '尚無資料',
    colorClass: 'bg-seat-unknown text-seat-unknown-border border border-seat-unknown-border'
  }
];

const formatLastUpdated = (isoString?: string) => {
  if (!isoString) {
    return '即時資料尚未更新';
  }

  const date = new Date(isoString);
  return `最後更新：${date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

export const InfoFooter = ({ lastUpdated }: InfoFooterProps) => {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4">
      <div className="pointer-events-auto rounded-3xl bg-white/85 px-6 py-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-4 text-sm text-gray-700">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.colorClass}`}>
                <span className="sr-only">{item.label}</span>
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">{formatLastUpdated(lastUpdated)}</p>
      </div>
    </div>
  );
};
