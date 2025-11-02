import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useGeolocation } from '@/hooks/useGeolocation';

describe('useGeolocation', () => {
  const originalGeolocation = navigator.geolocation;

  const mockGeolocation = () => {
    const getCurrentPosition = vi.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition }
    });
    return getCurrentPosition;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: originalGeolocation
    });
  });

  it('returns current position when permission granted and supports retry', async () => {
    const getCurrentPosition = mockGeolocation();

    getCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({
        coords: { latitude: 25.033964, longitude: 121.564468 } as GeolocationCoordinates,
        timestamp: Date.now()
      } as GeolocationPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(result.current.location).toEqual({ lat: 25.033964, lng: 121.564468 });
    expect(result.current.error).toBeNull();

    act(() => {
      result.current.retry();
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it('falls back to default coordinates when permission denied', async () => {
    const getCurrentPosition = mockGeolocation();

    getCurrentPosition.mockImplementation((_, error: PositionErrorCallback) => {
      error({
        code: 1,
        message: 'Permission denied',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      });
    });

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.location).toEqual({ lat: 25.042233, lng: 121.535404 });
    expect(result.current.error).toContain('未取得定位權限');

    act(() => {
      result.current.retry();
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });
});
