import { FallbackBadge } from './FallbackBadge';
import type { PredictionResponse } from '@/types/prediction';

interface PredictionSectionProps {
  data?: PredictionResponse | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const getPredictionColor = (predictedSeats: number) => {
  if (predictedSeats <= 0) {
    return 'text-seat-full';
  }

  return 'text-seat-available';
};

export const PredictionSection = ({ data, isLoading, isError, onRetry }: PredictionSectionProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">座位預測</p>
        <p className="mt-4 text-sm text-gray-500">預測資料載入中...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">座位預測</p>
        <p className="mt-4 text-sm text-gray-500">預測資料暫時無法取得。</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          重新嘗試
        </button>
      </div>
    );
  }

  if (!data || data.predictions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">座位預測</p>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.predictions.map((prediction) => (
          <div key={prediction.horizon_minutes} className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{prediction.horizon_minutes} 分鐘後</span>
              {prediction.is_fallback && <FallbackBadge />}
            </div>
            <span className={`text-lg font-semibold ${getPredictionColor(prediction.predicted_seats)}`}>
              {prediction.predicted_seats}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
