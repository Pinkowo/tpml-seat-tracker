/**
 * API 資料轉換器
 *
 * 處理 backend API 回應與 frontend 資料格式之間的轉換
 */

import type { LibraryApiItem, RealtimeSeatItem, CurrentSeats } from '@/types/api';
import type { Library, SeatStatus, OperatingHours, LibraryWithSeat } from '@/types/library';

/**
 * 計算營業時間資訊
 *
 * @param is_open - 是否營業中
 * @param closing_in_minutes - 距離閉館分鐘數
 * @returns 營業時間物件
 */
export function calculateOperatingHours(
  is_open: boolean,
  closing_in_minutes: number | null
): OperatingHours | undefined {
  // 如果沒有 closing_in_minutes 資訊，回傳 undefined
  if (closing_in_minutes === null) {
    return undefined;
  }

  // 簡化版本：僅返回基本的營業狀態
  // 實際的 openTime/closeTime 需要從 backend 的 open_hours 解析
  return {
    openTime: '09:00', // 預設值，實際應從 API 取得
    closeTime: '21:00', // 預設值，實際應從 API 取得
    isOpen: is_open,
    closesInMinutes: is_open ? closing_in_minutes : null,
    nextOpenTime: !is_open && closing_in_minutes ? '明日開館' : null,
  };
}

/**
 * 轉換 backend library 格式為 frontend Library 型別
 *
 * @param apiLibrary - backend API 回應的 library 物件
 * @param libraryId - 圖書館 ID (從 index 產生或從其他來源取得)
 * @returns Frontend Library 物件
 */
export function adaptLibraryResponse(
  apiLibrary: LibraryApiItem,
  libraryId: number
): Library {
  return {
    id: libraryId,
    name: apiLibrary.branch_name,
    address: apiLibrary.address,
    latitude: apiLibrary.latitude,
    longitude: apiLibrary.longitude,
    // 距離從 km 轉換為 m
    distance: apiLibrary.distance_km !== null ? apiLibrary.distance_km * 1000 : undefined,
    operatingHours: calculateOperatingHours(
      apiLibrary.is_open,
      apiLibrary.closing_in_minutes
    ),
  };
}

/**
 * 轉換 backend realtime 格式為 frontend SeatStatus 型別
 *
 * @param realtimeSeat - backend API 回應的 realtime seat 物件
 * @param library - 對應的 Library 物件
 * @returns Frontend SeatStatus 物件，如果座位數為 null 則回傳 undefined
 */
export function adaptSeatResponse(
  realtimeSeat: RealtimeSeatItem | undefined,
  library: Library
): SeatStatus | undefined {
  if (!realtimeSeat) {
    return undefined;
  }

  return {
    library,
    available_seats: realtimeSeat.total_free_count,
    total_seats: realtimeSeat.total_seat_count,
    updated_at: realtimeSeat.last_updated,
  };
}

/**
 * 從 CurrentSeats 建立 SeatStatus
 *
 * @param currentSeats - backend API 的 current_seats 物件
 * @param library - 對應的 Library 物件
 * @returns Frontend SeatStatus 物件，如果 currentSeats 為 null 則回傳 undefined
 */
export function adaptCurrentSeatsResponse(
  currentSeats: CurrentSeats | null,
  library: Library
): SeatStatus | undefined {
  if (!currentSeats) {
    return undefined;
  }

  return {
    library,
    available_seats: currentSeats.free,
    total_seats: currentSeats.total,
    updated_at: new Date().toISOString(), // 使用當前時間作為更新時間
  };
}

/**
 * 合併 libraries API 與 realtime API 的回應
 *
 * @param libraries - 從 /libraries API 取得的館別列表
 * @param realtimeSeats - 從 /realtime API 取得的座位資料 (可選)
 * @returns LibraryWithSeat 陣列
 */
export function mergeLibrariesWithSeats(
  libraries: LibraryApiItem[],
  realtimeSeats?: RealtimeSeatItem[]
): LibraryWithSeat[] {
  return libraries.map((apiLibrary, index) => {
    const library = adaptLibraryResponse(apiLibrary, index + 1);

    // 優先使用 current_seats (已包含在 /libraries 回應中)
    let seatStatus: SeatStatus | undefined;

    if (apiLibrary.current_seats) {
      seatStatus = adaptCurrentSeatsResponse(apiLibrary.current_seats, library);
    } else if (realtimeSeats) {
      // 如果沒有 current_seats，嘗試從 realtime API 找到對應的座位資料
      const realtimeSeat = realtimeSeats.find(
        (seat) => seat.branch_name === apiLibrary.branch_name
      );
      seatStatus = adaptSeatResponse(realtimeSeat, library);
    }

    return {
      ...library,
      seatStatus,
    };
  });
}
