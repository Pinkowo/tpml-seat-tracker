import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('mapbox-gl', () => {
  const mockMapInstance = {
    on: vi.fn(),
    remove: vi.fn(),
    flyTo: vi.fn(),
    addControl: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lng: 121.5654, lat: 25.033 }),
    getZoom: vi.fn().mockReturnValue(12)
  };

  const mapbox = {
    accessToken: '',
    Map: vi.fn(() => mockMapInstance),
    NavigationControl: vi.fn(),
    Marker: vi.fn(({ element }: { element: HTMLElement }) => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
      getElement: vi.fn(() => element)
    }))
  };

  return {
    ...mapbox,
    default: mapbox
  };
});
