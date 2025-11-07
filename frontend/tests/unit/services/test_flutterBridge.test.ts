/**
 * Flutter Bridge 服務的 unit tests
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkBridgeAvailable,
  requestLocation,
  setupLocationListener,
  getLocationAsync,
  type Position,
} from '@/services/flutterBridge';

describe('Flutter Bridge Service', () => {
  let originalFlutterObject: any;

  beforeEach(() => {
    // 儲存原始的 window.flutterObject
    originalFlutterObject = window.flutterObject;
  });

  afterEach(() => {
    // 恢復原始狀態
    window.flutterObject = originalFlutterObject;
    window.handleFlutterMessage = undefined;
  });

  describe('checkBridgeAvailable', () => {
    it('應在 Bridge 可用時回傳 true', () => {
      window.flutterObject = {
        postMessage: vi.fn(),
      };

      expect(checkBridgeAvailable()).toBe(true);
    });

    it('應在 Bridge 不可用時回傳 false', () => {
      window.flutterObject = undefined;

      expect(checkBridgeAvailable()).toBe(false);
    });

    it('應在 postMessage 方法缺失時回傳 false', () => {
      window.flutterObject = {} as any;

      expect(checkBridgeAvailable()).toBe(false);
    });
  });

  describe('requestLocation', () => {
    it('應在 Bridge 可用時成功發送定位請求', () => {
      const postMessageMock = vi.fn();
      window.flutterObject = {
        postMessage: postMessageMock,
      };

      const result = requestLocation();

      expect(result).toBe(true);
      expect(postMessageMock).toHaveBeenCalledWith(
        JSON.stringify({ name: 'location', data: null })
      );
    });

    it('應在 Bridge 不可用時回傳 false', () => {
      window.flutterObject = undefined;

      const result = requestLocation();

      expect(result).toBe(false);
    });

    it('應在 postMessage 拋出錯誤時回傳 false', () => {
      window.flutterObject = {
        postMessage: vi.fn(() => {
          throw new Error('Bridge error');
        }),
      };

      const result = requestLocation();

      expect(result).toBe(false);
    });
  });

  describe('setupLocationListener', () => {
    it('應正確設定監聽器', () => {
      const callback = vi.fn();

      const cleanup = setupLocationListener(callback);

      expect(window.handleFlutterMessage).toBeDefined();
      expect(typeof window.handleFlutterMessage).toBe('function');

      cleanup();

      expect(window.handleFlutterMessage).toBeUndefined();
    });

    it('應在定位成功時呼叫 callback 並傳入 position', () => {
      const callback = vi.fn();
      setupLocationListener(callback);

      const mockPosition: Position = {
        latitude: 25.0330,
        longitude: 121.5654,
        accuracy: 10,
      };

      // 模擬 Flutter 回應
      window.handleFlutterMessage?.({
        name: 'location',
        data: mockPosition,
      });

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 25.0330,
          longitude: 121.5654,
          accuracy: 10,
        }),
        null
      );
    });

    it('應在定位失敗時呼叫 callback 並傳入 error', () => {
      const callback = vi.fn();
      setupLocationListener(callback);

      // 模擬 Flutter 回應（失敗：data 為空陣列）
      window.handleFlutterMessage?.({
        name: 'location',
        data: [],
      });

      expect(callback).toHaveBeenCalledWith(null, '定位失敗或權限被拒絕');
    });

    it('應忽略非 location 訊息', () => {
      const callback = vi.fn();
      setupLocationListener(callback);

      window.handleFlutterMessage?.({
        name: 'other',
        data: {},
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('清理函式應移除監聽器', () => {
      const callback = vi.fn();
      const cleanup = setupLocationListener(callback);

      expect(window.handleFlutterMessage).toBeDefined();

      cleanup();

      expect(window.handleFlutterMessage).toBeUndefined();
    });
  });

  describe('getLocationAsync', () => {
    it('應在定位成功時 resolve', async () => {
      window.flutterObject = {
        postMessage: vi.fn(),
      };

      const mockPosition: Position = {
        latitude: 25.0330,
        longitude: 121.5654,
        accuracy: 10,
      };

      // 模擬非同步回應
      setTimeout(() => {
        window.handleFlutterMessage?.({
          name: 'location',
          data: mockPosition,
        });
      }, 50);

      const position = await getLocationAsync(1000);

      expect(position).toEqual(
        expect.objectContaining({
          latitude: 25.0330,
          longitude: 121.5654,
        })
      );
    });

    it('應在定位失敗時 reject', async () => {
      window.flutterObject = {
        postMessage: vi.fn(),
      };

      // 模擬失敗回應
      setTimeout(() => {
        window.handleFlutterMessage?.({
          name: 'location',
          data: [],
        });
      }, 50);

      await expect(getLocationAsync(1000)).rejects.toThrow('定位失敗或權限被拒絕');
    });

    it('應在超時時 reject', async () => {
      window.flutterObject = {
        postMessage: vi.fn(),
      };

      // 不回應，觸發超時
      await expect(getLocationAsync(100)).rejects.toThrow('定位請求超時');
    });

    it('應在 Bridge 不可用時立即 reject', async () => {
      window.flutterObject = undefined;

      await expect(getLocationAsync()).rejects.toThrow('Flutter Bridge 不可用');
    });
  });
});
