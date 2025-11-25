/**
 * 使用者位置標記元件
 *
 * 在地圖上顯示使用者當前位置（藍色圓點 + 半透明光圈）
 *
 * 設計規範：
 * - 標記樣式：藍色圓點 16x16px（#5AB4C5 Primary/500）
 * - 光圈效果：外圍半透明光圈 radius 32px，脈衝動畫（opacity 0.2 → 0.6）
 * - 陰影：0 2px 8px rgba(90, 180, 197, 0.4)
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export interface UserLocationMarkerProps {
  map: mapboxgl.Map | null;
  location: { lat: number; lng: number } | null;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ map, location }) => {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !location) {
      // 清理舊的標記
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    // 建立標記 DOM 元素
    const markerElement = document.createElement('div');
    markerElement.className = 'user-location-marker';

    // 添加樣式
    markerElement.innerHTML = `
      <style>
        .user-location-marker {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-location-marker::before {
          content: '';
          position: absolute;
          width: 32px;
          height: 32px;
          background: rgba(90, 180, 197, 0.2);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .user-location-dot {
          position: relative;
          width: 16px;
          height: 16px;
          background: #5AB4C5;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(90, 180, 197, 0.4);
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }
      </style>
      <div class="user-location-dot"></div>
    `;

    // 建立 Mapbox Marker
    const marker = new mapboxgl.Marker({
      element: markerElement,
      anchor: 'center',
    })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    // 儲存 marker reference
    markerRef.current = marker;

    // 清理函式
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, location]);

  // 此元件不渲染任何 DOM（標記直接添加到 map）
  return null;
};

export default UserLocationMarker;
