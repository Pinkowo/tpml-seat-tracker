import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import mapboxgl from 'mapbox-gl';
import type { Map as MapboxMap } from 'mapbox-gl';
import { MarkerLayer } from '@/components/map/MarkerLayer';
import type { LibraryWithSeat } from '@/types/library';

describe('MarkerLayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates markers with correct accessibility labels and colors', async () => {
    const libraries: LibraryWithSeat[] = [
      {
        id: 1,
        name: '總館',
        address: '臺北市大安區建國南路二段125號',
        latitude: 25.02607,
        longitude: 121.54044,
        seatStatus: {
          library: {
            id: 1,
            name: '總館',
            address: '臺北市大安區建國南路二段125號',
            latitude: 25.02607,
            longitude: 121.54044
          },
          available_seats: 10,
          total_seats: 120,
          updated_at: new Date().toISOString()
        }
      },
      {
        id: 2,
        name: '天母分館',
        address: '臺北市士林區天母西路62號',
        latitude: 25.11622,
        longitude: 121.5256,
        seatStatus: {
          library: {
            id: 2,
            name: '天母分館',
            address: '臺北市士林區天母西路62號',
            latitude: 25.11622,
            longitude: 121.5256
          },
          available_seats: 0,
          total_seats: 80,
          updated_at: new Date().toISOString()
        }
      }
    ];

    render(
      <MarkerLayer
        map={{} as unknown as MapboxMap}
        libraries={libraries}
        selectedLibraryId={1}
        onMarkerClick={vi.fn()}
      />
    );

    const markerMock = mapboxgl.Marker as unknown as vi.Mock;

    await waitFor(() => {
      expect(markerMock).toHaveBeenCalledTimes(2);
    });

    const [[firstMarkerArgs], [secondMarkerArgs]] = markerMock.mock.calls;

    const firstElement = firstMarkerArgs.element as HTMLButtonElement;
    expect(firstElement.getAttribute('aria-label')).toContain('目前有 10 個可用座位');
    expect(firstElement.className).toContain('bg-seat-available');
    expect(firstElement.className).toContain('scale-110');

    const secondElement = secondMarkerArgs.element as HTMLButtonElement;
    expect(secondElement.getAttribute('aria-label')).toContain('目前沒有可用座位');
    expect(secondElement.className).toContain('bg-seat-full');
  });
});
