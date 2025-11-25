interface ClosingWarningProps {
  closingInMinutes?: number | null;
}

export const ClosingWarning = ({ closingInMinutes }: ClosingWarningProps) => {
  if (closingInMinutes === null || closingInMinutes === undefined) {
    return null;
  }

  if (closingInMinutes > 60) {
    return null;
  }

  const isCritical = closingInMinutes <= 15;
  const containerClass = isCritical
    ? 'bg-[rgba(212,82,81,0.1)] text-[#D45251]'
    : 'bg-[rgba(253,133,58,0.1)] text-[#FD853A]';
  const message = isCritical
    ? `即將閉館（${Math.max(closingInMinutes, 0)} 分鐘）`
    : `距離閉館 ${Math.max(closingInMinutes, 0)} 分鐘`;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm font-semibold ${containerClass}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
