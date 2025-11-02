import type { OperatingHours } from '@/types/library';

interface OpeningHoursProps {
  operatingHours?: OperatingHours | null;
  isOpen: boolean;
}

export const OpeningHours = ({ operatingHours, isOpen }: OpeningHoursProps) => {
  if (!operatingHours) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">開放時間</p>
        <p className="mt-3 text-sm text-gray-500">目前尚無營業時間資訊。</p>
      </div>
    );
  }

  const statusLabel = isOpen ? '營業中' : '已閉館';
  const statusClass = isOpen ? 'bg-seat-available/10 text-seat-available' : 'bg-gray-200 text-gray-500';

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">今日營業時間</p>
          <p className="mt-2 text-base font-semibold text-gray-800">
            {operatingHours.openTime} - {operatingHours.closeTime}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
      </div>
      {!isOpen && operatingHours.nextOpenTime && (
        <p className="mt-3 text-xs text-gray-500">下次開放時間：{operatingHours.nextOpenTime}</p>
      )}
    </div>
  );
};
