/**
 * Flutter JS Bridge 服務
 *
 * 封裝與 Flutter WebView 的 JavaScript Bridge 通訊邏輯
 *
 * 使用方式：
 * - 檢查 Bridge 可用性：checkBridgeAvailable()
 * - 請求定位：requestLocation()
 * - 監聽定位回應：setupLocationListener(callback)
 */

/**
 * Flutter Bridge 訊息格式
 */
interface FlutterMessage {
  name: string;
  data: any;
}

/**
 * 定位回應資料格式
 */
export interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

/**
 * Flutter Bridge 全域物件型別擴展
 */
declare global {
  interface Window {
    flutterObject?: {
      postMessage(message: string): void;
    };
    handleFlutterMessage?: (message: FlutterMessage) => void;
  }
}

/**
 * 檢查 Flutter Bridge 是否可用
 *
 * @returns {boolean} Bridge 是否可用
 */
export function checkBridgeAvailable(): boolean {
  return typeof window !== 'undefined' &&
         typeof window.flutterObject !== 'undefined' &&
         typeof window.flutterObject.postMessage === 'function';
}

/**
 * 發送定位請求到 Flutter
 *
 * @returns {boolean} 是否成功發送請求
 */
export function requestLocation(): boolean {
  if (!checkBridgeAvailable()) {
    console.warn('[Flutter Bridge] Flutter Bridge 不可用，無法請求定位');
    return false;
  }

  try {
    const message: FlutterMessage = {
      name: 'location',
      data: null
    };

    window.flutterObject!.postMessage(JSON.stringify(message));
    console.log('[Flutter Bridge] 已發送定位請求');
    return true;
  } catch (error) {
    console.error('[Flutter Bridge] 發送定位請求失敗：', error);
    return false;
  }
}

/**
 * 定位回應回調函式型別
 */
export type LocationCallback = (position: Position | null, error: string | null) => void;

/**
 * 設定定位回應監聽器
 *
 * @param callback - 定位回應的回調函式
 * @returns {() => void} 清除監聽器的函式
 */
export function setupLocationListener(callback: LocationCallback): () => void {
  if (typeof window === 'undefined') {
    console.warn('[Flutter Bridge] window 未定義，無法設定監聽器');
    return () => {};
  }

  // 定義處理 Flutter 訊息的函式
  const handleMessage = (message: FlutterMessage) => {
    if (message.name === 'location') {
      // 處理定位回應
      if (Array.isArray(message.data) && message.data.length === 0) {
        // 定位失敗：data 為空陣列
        console.warn('[Flutter Bridge] 定位失敗或被拒絕');
        callback(null, '定位失敗或權限被拒絕');
      } else if (message.data && typeof message.data === 'object') {
        // 定位成功：data 為 Position 物件
        const position: Position = {
          latitude: message.data.latitude,
          longitude: message.data.longitude,
          accuracy: message.data.accuracy,
          altitude: message.data.altitude ?? null,
          altitudeAccuracy: message.data.altitudeAccuracy ?? null,
          heading: message.data.heading ?? null,
          speed: message.data.speed ?? null,
          timestamp: message.data.timestamp ?? Date.now()
        };

        console.log('[Flutter Bridge] 定位成功：', position);
        callback(position, null);
      } else {
        console.error('[Flutter Bridge] 未知的定位回應格式：', message.data);
        callback(null, '未知的回應格式');
      }
    }
  };

  // 設定全域處理函式
  window.handleFlutterMessage = handleMessage;

  console.log('[Flutter Bridge] 定位監聽器已設定');

  // 返回清除函式
  return () => {
    if (window.handleFlutterMessage === handleMessage) {
      window.handleFlutterMessage = undefined;
      console.log('[Flutter Bridge] 定位監聽器已清除');
    }
  };
}

/**
 * 一次性請求定位（Promise 版本）
 *
 * @param timeout - 超時時間（毫秒），預設 10000ms
 * @returns {Promise<Position>} 定位結果
 */
export function getLocationAsync(timeout: number = 10000): Promise<Position> {
  return new Promise((resolve, reject) => {
    if (!checkBridgeAvailable()) {
      reject(new Error('Flutter Bridge 不可用'));
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let cleanup: (() => void) | null = null;

    // 設定超時
    timeoutId = setTimeout(() => {
      if (cleanup) cleanup();
      reject(new Error('定位請求超時'));
    }, timeout);

    // 設定監聽器
    cleanup = setupLocationListener((position, error) => {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();

      if (error) {
        reject(new Error(error));
      } else if (position) {
        resolve(position);
      } else {
        reject(new Error('未知錯誤'));
      }
    });

    // 發送請求
    if (!requestLocation()) {
      clearTimeout(timeoutId);
      if (cleanup) cleanup();
      reject(new Error('發送定位請求失敗'));
    }
  });
}

/**
 * Flutter Bridge 服務物件（預設導出）
 */
const flutterBridge = {
  checkBridgeAvailable,
  requestLocation,
  setupLocationListener,
  getLocationAsync,
};

export default flutterBridge;
