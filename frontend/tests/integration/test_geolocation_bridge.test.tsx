/**
 * 定位整合測試（Flutter Bridge + navigator.geolocation 降級）
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';

describe('Geolocation Integration', () => {
  let originalFlutterObject: any;
  let originalGeolocation: any;

  beforeEach(() => {
    originalFlutterObject = window.flutterObject;
    originalGeolocation = navigator.geolocation;
  });

  afterEach(() => {
    window.flutterObject = originalFlutterObject;
    window.handleFlutterMessage = undefined;
    (navigator as any).geolocation = originalGeolocation;
  });

  describe('Flutter Bridge 可用時', () => {
    it('應使用 Flutter Bridge 取得定位', async () => {
      const postMessageMock = vi.fn();
      window.flutterObject = {
        postMessage: postMessageMock,
      };

      const { result } = renderHook(() => useGeolocation(true));

      // 等待 requestLocation 被呼叫
      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalled();
      });

      // 模擬 Flutter 回應
      window.handleFlutterMessage?.({
        name: 'location',
        data: {
          latitude: 25.0330,
          longitude: 121.5654,
          accuracy: 10,
        },
      });

      // 等待狀態更新
      await waitFor(() => {
        expect(result.current.location).toEqual({
          lat: 25.0330,
          lng: 121.5654,
        });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('應處理 Flutter Bridge 定位失敗', async () => {
      window.flutterObject = {
        postMessage: vi.fn(),
      };

      const { result } = renderHook(() => useGeolocation(true));

      // 模擬定位失敗（data 為空陣列）
      window.handleFlutterMessage?.({
        name: 'location',
        data: [],
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // 應使用預設位置
      expect(result.current.location).toEqual({
        lat: 25.042233,
        lng: 121.535404,
      });
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Flutter Bridge 不可用時（降級模式）', () => {
    it('應降級使用 navigator.geolocation', async () => {
      // 移除 Flutter Bridge
      window.flutterObject = undefined;

      // 模擬 navigator.geolocation
      const getCurrentPositionMock = vi.fn((success) => {
        success({
          coords: {
            latitude: 25.0330,
            longitude: 121.5654,
            accuracy: 20,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      });

      (navigator as any).geolocation = {
        getCurrentPosition: getCurrentPositionMock,
      };

      const { result } = renderHook(() => useGeolocation(true));

      await waitFor(() => {
        expect(result.current.location).toEqual({
          lat: 25.0330,
          lng: 121.5654,
        });
      });

      expect(getCurrentPositionMock).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('應處理 navigator.geolocation 權限拒絕', async () => {
      window.flutterObject = undefined;

      const getCurrentPositionMock = vi.fn((_, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied geolocation',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      });

      (navigator as any).geolocation = {
        getCurrentPosition: getCurrentPositionMock,
      };

      const { result } = renderHook(() => useGeolocation(true));

      await waitFor(() => {
        expect(result.current.error).toContain('未取得定位權限');
      });

      // 應使用預設位置
      expect(result.current.location).toEqual({
        lat: 25.042233,
        lng: 121.535404,
      });
    });
  });

  describe('重試機制', () => {
    it('應能夠重新請求定位', async () => {
      const postMessageMock = vi.fn();
      window.flutterObject = {
        postMessage: postMessageMock,
      };

      const { result } = renderHook(() => useGeolocation(true));

      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalled();
      });

      // 模擬失敗
      window.handleFlutterMessage?.({
        name: 'location',
        data: [],
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // 重試
      postMessageMock.mockClear();
      result.current.retry();

      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('disable 狀態', () => {
    it('enable=false 時應使用預設位置', () => {
      const { result } = renderHook(() => useGeolocation(false));

      expect(result.current.location).toEqual({
        lat: 25.042233,
        lng: 121.535404,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
