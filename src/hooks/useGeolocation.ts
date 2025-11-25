import { useEffect, useState } from 'react';
import { checkBridgeAvailable, setupLocationListener, requestLocation as requestFlutterLocation, Position } from '@/services/flutterBridge';

const DEFAULT_CENTER = { lat: 25.042233, lng: 121.535404 };

export interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
  retry: () => void;
}

export const useGeolocation = (enable = true): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    location: enable ? null : DEFAULT_CENTER,
    error: null,
    loading: enable,
    retry: () => {}
  });

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const requestLocation = () => {
      if (!enable) {
        setState({ location: DEFAULT_CENTER, error: null, loading: false, retry: requestLocation });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, retry: requestLocation }));

      // 優先使用 Flutter JS Bridge
      if (checkBridgeAvailable()) {
        console.log('[useGeolocation] 使用 Flutter JS Bridge 取得定位');

        // 設定監聽器
        cleanup = setupLocationListener((position: Position | null, error: string | null) => {
          if (error) {
            // 定位失敗
            setState({
              location: DEFAULT_CENTER,
              error: `定位失敗：${error}。已使用預設位置（台北市政府）。`,
              loading: false,
              retry: requestLocation
            });
          } else if (position) {
            // 定位成功
            setState({
              location: {
                lat: position.latitude,
                lng: position.longitude
              },
              error: null,
              loading: false,
              retry: requestLocation
            });
          }
        });

        // 發送定位請求
        if (!requestFlutterLocation()) {
          // 發送失敗，降級使用 navigator.geolocation
          console.warn('[useGeolocation] Flutter Bridge 請求失敗，降級使用 navigator.geolocation');
          if (cleanup) cleanup();
          useBrowserGeolocation(requestLocation);
        }
      } else {
        // 降級使用 navigator.geolocation
        console.log('[useGeolocation] Flutter Bridge 不可用，使用 navigator.geolocation');
        useBrowserGeolocation(requestLocation);
      }
    };

    // 瀏覽器原生定位邏輯
    const useBrowserGeolocation = (retryFn: () => void) => {
      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        setState({
          location: DEFAULT_CENTER,
          error: '裝置不支援定位功能。請手動瀏覽地圖或輸入地址，已使用預設位置（台北市政府）。',
          loading: false,
          retry: retryFn
        });
        return;
      }

      const onSuccess: PositionCallback = (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          error: null,
          loading: false,
          retry: retryFn
        });
      };

      const onError: PositionErrorCallback = (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? '未取得定位權限。請在瀏覽器設定允許定位後重新整理頁面，已使用預設位置（台北市政府）。'
            : '取得定位資訊時發生問題。請稍後再試或手動拖曳地圖，已使用預設位置（台北市政府）。';

        setState({
          location: DEFAULT_CENTER,
          error: message,
          loading: false,
          retry: retryFn
        });
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    };

    requestLocation();

    setState((prev) => ({ ...prev, retry: requestLocation }));

    // 清理函式
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [enable]);

  return state;
};
