/**
 * Library API 呼叫函式
 *
 * 提供與 backend API 的介面層，處理所有圖書館相關的 API 請求
 */

import type {
  LibrariesResponse,
  RealtimeResponse,
  PredictionApiResponse,
} from '@/types/api';
import { getApiClient } from '@/services/api';
import { captureError } from '@/services/errorLogger';
import {
  getMockLibrariesResponse,
  getMockPredictionResponse,
  getMockRealtimeResponse,
  mockDelay,
} from '@/mocks/mockApi';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * 取得圖書館列表與座位資訊
 *
 * @param params - 查詢參數
 * @param params.user_lat - 使用者緯度 (可選)
 * @param params.user_lng - 使用者經度 (可選)
 * @param params.sort_by - 排序方式: 'distance' | 'seats' (預設: 'distance')
 * @param params.branch_name - 篩選特定館別 (可選)
 * @returns 圖書館列表與座位資訊
 */
export async function fetchLibraries(params?: {
  user_lat?: number;
  user_lng?: number;
  sort_by?: 'distance' | 'seats';
  branch_name?: string;
}): Promise<LibrariesResponse> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return getMockLibrariesResponse({
      branch_name: params?.branch_name,
      sort_by: params?.sort_by,
    });
  }

  try {
    const client = await getApiClient();
    const response = await client.get<LibrariesResponse>('/api/v1/libraries', {
      params: {
        user_lat: params?.user_lat,
        user_lng: params?.user_lng,
        sort_by: params?.sort_by ?? 'distance',
        branch_name: params?.branch_name,
      },
    });
    return response.data;
  } catch (error) {
    captureError(error, { scope: 'fetchLibraries', params });
    throw new Error(
      error instanceof Error ? error.message : '無法取得圖書館資料，請稍後再試'
    );
  }
}

/**
 * 取得即時座位資料
 *
 * @param branch_name - 館別名稱 (可選，不提供則回傳所有館別)
 * @returns 即時座位資料
 */
export async function fetchRealtimeSeats(
  branch_name?: string
): Promise<RealtimeResponse> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return getMockRealtimeResponse(branch_name);
  }

  try {
    const client = await getApiClient();
    const response = await client.get<RealtimeResponse>('/api/v1/realtime', {
      params: branch_name ? { branch_name } : undefined,
    });
    return response.data;
  } catch (error) {
    captureError(error, { scope: 'fetchRealtimeSeats', branch_name });
    throw new Error(
      error instanceof Error ? error.message : '無法取得座位資料，請稍後再試'
    );
  }
}

/**
 * 取得座位預測資料
 *
 * @param branch_name - 館別名稱
 * @returns 預測資料 (30分鐘與60分鐘)
 */
export async function fetchPredictions(
  branch_name: string
): Promise<PredictionApiResponse> {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return getMockPredictionResponse(branch_name);
  }

  try {
    const client = await getApiClient();
    const response = await client.get<PredictionApiResponse>('/api/v1/predict', {
      params: { branch_name },
    });
    return response.data;
  } catch (error) {
    captureError(error, { scope: 'fetchPredictions', branch_name });
    throw new Error(
      error instanceof Error ? error.message : '無法取得預測資料，請稍後再試'
    );
  }
}
