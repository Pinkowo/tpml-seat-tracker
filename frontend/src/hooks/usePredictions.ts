import { useQuery } from '@tanstack/react-query';
import type { PredictionResponse } from '@/types/prediction';
import { fetchPredictions } from '@/services/libraryApi';

/**
 * 使用 Predictions API 取得座位預測資料
 *
 * 此 hook 會根據館別名稱呼叫 backend /api/v1/predict 端點
 * 並回傳 30 分鐘與 60 分鐘的座位預測
 *
 * @param branchName - 圖書館館別名稱
 * @param enabled - 是否啟用查詢
 */
export const usePredictions = (branchName: string | null, enabled: boolean) =>
  useQuery<PredictionResponse>({
    queryKey: ['predictions', branchName],
    queryFn: async () => {
      if (!branchName) {
        throw new Error('Branch name is required');
      }
      return await fetchPredictions(branchName);
    },
    enabled: enabled && Boolean(branchName),
    staleTime: 5 * 60 * 1000, // 5 分鐘內視為新鮮資料
    gcTime: 10 * 60 * 1000, // 快取 10 分鐘
  });
