import { useQuery } from '@tanstack/react-query';
import type { LibraryWithSeat } from '@/types/library';
import { fetchLibraries } from '@/services/libraryApi';
import { mergeLibrariesWithSeats } from '@/utils/apiAdapter';

/**
 * 使用 Libraries API 取得圖書館資料
 *
 * 此 hook 會根據使用者座標呼叫 backend /api/v1/libraries 端點
 * 並將回應轉換為前端所需的資料格式
 */
export const useLibraries = (coordinates?: { lat: number; lng: number }) =>
  useQuery<LibraryWithSeat[]>({
    queryKey: ['libraries', coordinates?.lat, coordinates?.lng],
    queryFn: async () => {
      // 檢查是否有完整的座標資訊
      const hasCoordinates = coordinates?.lat !== undefined && coordinates?.lng !== undefined;

      // 呼叫真實的 backend API
      const response = await fetchLibraries({
        user_lat: hasCoordinates ? coordinates.lat : undefined,
        user_lng: hasCoordinates ? coordinates.lng : undefined,
        sort_by: hasCoordinates ? 'distance' : 'seats', // 有座標時依距離排序，否則依座位數
      });

      // 轉換 backend 回應為 frontend 格式
      // /libraries API 已經包含 current_seats，不需要額外呼叫 /realtime
      return mergeLibrariesWithSeats(response.data);
    },
    gcTime: 10 * 60 * 1000, // 快取 10 分鐘
    staleTime: 5 * 60 * 1000, // 5 分鐘內視為新鮮資料
    placeholderData: (previousData) => previousData,
    refetchInterval: 10 * 60 * 1000, // 每 10 分鐘自動重新拉取
  });

/**
 * 整合的 Library Data Hook
 *
 * 提供完整的圖書館資料，包含座位資訊、營業時間等
 */
export const useLibraryData = (coordinates?: { lat: number; lng: number }) => {
  const librariesQuery = useLibraries(coordinates);

  return {
    libraries: librariesQuery.data ?? [],
    isLoading: librariesQuery.isLoading,
    isFetching: librariesQuery.isFetching,
    isError: librariesQuery.isError,
    error: librariesQuery.error,
    refetch: librariesQuery.refetch,
  };
};
