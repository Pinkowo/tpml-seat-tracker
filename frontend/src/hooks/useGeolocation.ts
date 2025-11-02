import { useEffect, useState } from 'react';

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
    const requestLocation = () => {
      if (!enable) {
        setState({ location: DEFAULT_CENTER, error: null, loading: false, retry: requestLocation });
        return;
      }

      if (typeof window === 'undefined' || !('geolocation' in navigator)) {
        setState({
          location: DEFAULT_CENTER,
          error: '裝置不支援定位功能。請手動瀏覽地圖或輸入地址，已使用預設位置（台北市政府）。',
          loading: false,
          retry: requestLocation
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, retry: requestLocation }));

      const onSuccess: PositionCallback = (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          error: null,
          loading: false,
          retry: requestLocation
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
          retry: requestLocation
        });
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    };

    requestLocation();

    setState((prev) => ({ ...prev, retry: requestLocation }));
  }, [enable]);

  return state;
};
