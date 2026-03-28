const DEFAULT_CENTER = { lat: 25.042233, lng: 121.535404 };

const noop = () => {};

export interface GeolocationState {
  location: { lat: number; lng: number };
  error: null;
  loading: false;
  retry: () => void;
}

export const useGeolocation = (): GeolocationState => ({
  location: DEFAULT_CENTER,
  error: null,
  loading: false,
  retry: noop,
});
