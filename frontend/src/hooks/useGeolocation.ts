import { useEffect, useState } from 'react';

export interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

const DEFAULT_CENTER = { lat: 25.042233, lng: 121.535404 };

export const useGeolocation = (enable = true): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    location: enable ? null : DEFAULT_CENTER,
    error: null,
    loading: enable
  });

  useEffect(() => {
    if (!enable) {
      setState({ location: DEFAULT_CENTER, error: null, loading: false });
      return;
    }

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setState({
        location: DEFAULT_CENTER,
        error: '裝置不支援定位功能，已使用預設位置。',
        loading: false
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
        loading: false
      });
    };

    const onError: PositionErrorCallback = (error) => {
      const message =
        error.code === error.PERMISSION_DENIED
          ? '未取得定位權限，已使用預設位置。'
          : '取得定位資訊時發生錯誤，已使用預設位置。';

      setState({
        location: DEFAULT_CENTER,
        error: message,
        loading: false
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    return () => {
      setState((prev) => ({ ...prev, loading: false }));
    };
  }, [enable]);

  return state;
};
