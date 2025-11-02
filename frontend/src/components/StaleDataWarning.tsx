interface StaleDataWarningProps {
  lastUpdated?: string | null;
  thresholdMinutes?: number;
}

const DEFAULT_THRESHOLD = 15;

const getMinutesAgo = (timestamp: string) => {
  const updatedTime = new Date(timestamp).getTime();
  if (Number.isNaN(updatedTime)) {
    return null;
  }

  const diff = Date.now() - updatedTime;
  return Math.floor(diff / (60 * 1000));
};

export const StaleDataWarning = ({ lastUpdated, thresholdMinutes = DEFAULT_THRESHOLD }: StaleDataWarningProps) => {
  if (!lastUpdated) {
    return null;
  }

  const minutesAgo = getMinutesAgo(lastUpdated);

  if (minutesAgo === null || minutesAgo <= thresholdMinutes) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-[rgba(253,133,58,0.1)] px-4 py-3 text-sm font-semibold text-[#FD853A]">
      <span className="inline-flex h-2 w-2 rounded-full bg-[#FD853A]" aria-hidden="true" />
      資料可能不是最新的，上次更新：{minutesAgo} 分鐘前
    </div>
  );
};
