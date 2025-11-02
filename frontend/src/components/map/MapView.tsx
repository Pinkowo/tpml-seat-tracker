import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import { LibraryWithSeat } from '@/types/library';
import { MarkerLayer } from './MarkerLayer';

const DEFAULT_COORDINATE: [number, number] = [121.535404, 25.042233];

interface MapViewProps {
  libraries: LibraryWithSeat[];
  selectedLibraryId: number | null;
  onMarkerClick: (libraryId: number) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const MapView = ({
  libraries,
  selectedLibraryId,
  onMarkerClick,
  userLocation
}: MapViewProps) => {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !accessToken) {
      return;
    }

    let mapInstance: MapboxMap | null = null;
    let isCancelled = false;

    const initMap = async () => {
      const mapbox: typeof import('mapbox-gl') = await import('mapbox-gl');

      if (isCancelled || !mapNode.current) {
        return;
      }

      mapbox.accessToken = accessToken;
      mapInstance = new mapbox.Map({
        container: mapNode.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: userLocation ? [userLocation.lng, userLocation.lat] : DEFAULT_COORDINATE,
        zoom: 12
      });

      mapInstance.addControl(new mapbox.NavigationControl(), 'top-right');

      mapInstance.on('load', () => {
        if (!isCancelled) {
          setIsReady(true);
        }
      });

      mapRef.current = mapInstance;
    };

    void initMap();

    return () => {
      isCancelled = true;
      mapInstance?.remove();
      mapRef.current = null;
    };
  }, [accessToken, userLocation]);

  useEffect(() => {
    if (!mapRef.current || !userLocation) {
      return;
    }

    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
      speed: 1.4
    });
  }, [userLocation]);

  if (!accessToken) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center bg-gray-200 text-gray-600">
        無法顯示地圖，請在 .env 檔案中設定 VITE_MAPBOX_TOKEN。
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <div ref={mapNode} className="absolute inset-0" />
      {isReady && mapRef.current && (
        <MarkerLayer
          map={mapRef.current}
          libraries={libraries}
          selectedLibraryId={selectedLibraryId}
          onMarkerClick={onMarkerClick}
        />
      )}
    </div>
  );
};
