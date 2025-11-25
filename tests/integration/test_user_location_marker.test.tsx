/**
 * 使用者位置標記的渲染測試
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { UserLocationMarker } from '@/components/map/UserLocationMarker';
import type { Map as MapboxMap } from 'mapbox-gl';

// Mock Mapbox GL
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(function (this: any, options: any) {
      this.options = options;
      this.lngLat = null;
      this.map = null;
      this.setLngLat = vi.fn((lngLat: [number, number]) => {
        this.lngLat = lngLat;
        return this;
      });
      this.addTo = vi.fn((map: any) => {
        this.map = map;
        return this;
      });
      this.remove = vi.fn(() => {
        this.map = null;
        return this;
      });
      return this;
    }),
  },
}));

describe('UserLocationMarker', () => {
  let mockMap: MapboxMap;
  let MockedMarker: any;

  beforeEach(async () => {
    // 動態 import mock
    const mapboxgl = await import('mapbox-gl');
    MockedMarker = mapboxgl.default.Marker;

    // 建立 mock map
    mockMap = {
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('定位成功時應正確渲染標記', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    render(<UserLocationMarker map={mockMap} location={location} />);

    // 驗證 Marker 被建立
    expect(MockedMarker).toHaveBeenCalled();

    // 取得最後一次建立的 marker instance
    const markerInstance = MockedMarker.mock.results[MockedMarker.mock.results.length - 1]?.value;

    expect(markerInstance).toBeDefined();
    expect(markerInstance.setLngLat).toHaveBeenCalledWith([121.5654, 25.0330]);
    expect(markerInstance.addTo).toHaveBeenCalledWith(mockMap);
  });

  it('定位失敗時不應渲染標記', () => {
    render(<UserLocationMarker map={mockMap} location={null} />);

    // 不應建立 Marker
    expect(MockedMarker).not.toHaveBeenCalled();
  });

  it('map 為 null 時不應渲染標記', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    render(<UserLocationMarker map={null} location={location} />);

    expect(MockedMarker).not.toHaveBeenCalled();
  });

  it('位置更新時應更新標記位置', () => {
    const initialLocation = { lat: 25.0330, lng: 121.5654 };

    const { rerender } = render(
      <UserLocationMarker map={mockMap} location={initialLocation} />
    );

    const firstMarkerInstance = MockedMarker.mock.results[0]?.value;
    expect(firstMarkerInstance.setLngLat).toHaveBeenCalledWith([121.5654, 25.0330]);

    // 清除 mock 記錄
    MockedMarker.mockClear();

    // 更新位置
    const updatedLocation = { lat: 25.1024, lng: 121.5486 };
    rerender(<UserLocationMarker map={mockMap} location={updatedLocation} />);

    // 應建立新的 marker
    expect(MockedMarker).toHaveBeenCalled();
    const secondMarkerInstance =
      MockedMarker.mock.results[MockedMarker.mock.results.length - 1]?.value;
    expect(secondMarkerInstance.setLngLat).toHaveBeenCalledWith([121.5486, 25.1024]);

    // 舊的 marker 應被移除
    expect(firstMarkerInstance.remove).toHaveBeenCalled();
  });

  it('位置變為 null 時應移除標記', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    const { rerender } = render(<UserLocationMarker map={mockMap} location={location} />);

    const markerInstance = MockedMarker.mock.results[0]?.value;
    expect(markerInstance).toBeDefined();

    // 移除位置
    rerender(<UserLocationMarker map={mockMap} location={null} />);

    // marker 應被移除
    expect(markerInstance.remove).toHaveBeenCalled();
  });

  it('元件卸載時應清理標記', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    const { unmount } = render(<UserLocationMarker map={mockMap} location={location} />);

    const markerInstance = MockedMarker.mock.results[0]?.value;

    // 卸載元件
    unmount();

    // marker 應被移除
    expect(markerInstance.remove).toHaveBeenCalled();
  });

  it('標記元素應包含正確的 CSS 類別和樣式', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    render(<UserLocationMarker map={mockMap} location={location} />);

    const markerInstance = MockedMarker.mock.results[0]?.value;
    const markerElement = markerInstance.options.element;

    expect(markerElement).toBeDefined();
    expect(markerElement.className).toBe('user-location-marker');
    expect(markerElement.innerHTML).toContain('user-location-dot');
    expect(markerElement.innerHTML).toContain('animation: pulse');
  });

  it('標記應使用正確的 anchor 設定', () => {
    const location = { lat: 25.0330, lng: 121.5654 };

    render(<UserLocationMarker map={mockMap} location={location} />);

    const markerInstance = MockedMarker.mock.results[0]?.value;

    expect(markerInstance.options.anchor).toBe('center');
  });
});
