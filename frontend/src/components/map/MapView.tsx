import { useEffect, useRef, useState } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';
import type { LibraryWithSeat } from '@/types/library';
import { MarkerLayer } from './MarkerLayer';

const DEFAULT_COORDINATE: [number, number] = [121.535404, 25.042233];

interface MapViewProps {
  libraries: LibraryWithSeat[];
  selectedLibraryId: number | null;
  onMarkerClick: (libraryId: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  focusLibrary?: LibraryWithSeat | null;
}

export const MapView = ({
  libraries,
  selectedLibraryId,
  onMarkerClick,
  userLocation,
  focusLibrary
}: MapViewProps) => {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const lastFocusedLibraryId = useRef<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !accessToken) {
      return;
    }

    let mapInstance: MapboxMap | null = null;
    let isCancelled = false;

    const initMap = async () => {
      try {
        const { default: mapbox } = await import('mapbox-gl');

        if (isCancelled || !mapNode.current) {
          return;
        }

        setMapError(null);
        setIsReady(false);
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

      mapInstance.on('error', () => {
        if (!isCancelled) {
          setMapError(
            '地圖載入失敗，請確認 Mapbox Token 是否有效或網路連線是否正常，重新整理頁面後再試一次。'
          );
        }
      });

      mapRef.current = mapInstance;
      } catch (error) {
        if (!isCancelled) {
          console.error('Mapbox 初始化失敗', error);
          setMapError(
            '地圖元件載入失敗，請重新整理頁面或稍後再試。若問題持續，請確認 Mapbox 套件是否安裝完整。'
          );
        }
      }
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

  useEffect(() => {
    if (!mapRef.current || !focusLibrary) {
      if (!focusLibrary) {
        lastFocusedLibraryId.current = null;
      }
      return;
    }

    if (lastFocusedLibraryId.current === focusLibrary.id) {
      return;
    }

    mapRef.current.flyTo({
      center: [focusLibrary.longitude, focusLibrary.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      speed: 1.2
    });
    lastFocusedLibraryId.current = focusLibrary.id;
  }, [focusLibrary]);

  if (!accessToken) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center bg-gray-100 px-6 text-center text-gray-700">
        <div className="max-w-md space-y-3 rounded-2xl bg-white/90 p-6 shadow-card backdrop-blur">
          <h2 className="text-lg font-semibold text-primary">無法載入地圖</h2>
          <p className="text-sm leading-relaxed">
            尚未設定 Mapbox Token。請開啟 <code>.env</code>，填入{' '}
            <code>VITE_MAPBOX_TOKEN=你的 Token</code>，儲存後重新啟動開發伺服器。
          </p>
          <p className="text-xs text-gray-500">
            若尚未申請 Token，可先瀏覽標記與詳情（使用模擬資料）。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <div ref={mapNode} className="absolute inset-0" />
      {mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 px-6 text-center text-gray-700 backdrop-blur">
          <div className="max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-primary">地圖載入失敗</h2>
            <p className="text-sm leading-relaxed">{mapError}</p>
            <div className="flex flex-col gap-2 text-xs text-gray-500">
              <span>1. 確認 .env 中的 VITE_MAPBOX_TOKEN 是否正確。</span>
              <span>2. 檢查網路連線後重新整理此頁。</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              重新整理頁面
            </button>
          </div>
        </div>
      )}
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
