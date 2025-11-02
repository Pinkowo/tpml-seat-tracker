import { useEffect, useRef } from 'react';
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';
import type { LibraryWithSeat } from '@/types/library';

interface MarkerLayerProps {
  map: MapboxMap;
  libraries: LibraryWithSeat[];
  selectedLibraryId: number | null;
  onMarkerClick: (libraryId: number) => void;
}

interface MarkerEntry {
  marker: MapboxMarker;
  handleClick: () => void;
}

const MARKER_BASE_CLASS =
  'map-marker flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold shadow-map transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

const getMarkerVariantClass = (library: LibraryWithSeat) => {
  const availableSeats = library.seatStatus?.available_seats;

  if (availableSeats === undefined) {
    return 'bg-seat-unknown text-seat-unknown-border border-2 border-seat-unknown-border';
  }

  if (availableSeats === 0) {
    return 'bg-seat-full text-white';
  }

  return 'bg-seat-available text-white';
};

const getAriaLabel = (library: LibraryWithSeat) => {
  const status = library.seatStatus;

  if (!status) {
    return `${library.name}，目前無即時座位資料`;
  }

  if (status.available_seats === 0) {
    return `${library.name}，目前沒有可用座位`;
  }

  return `${library.name}，目前有 ${status.available_seats} 個可用座位`;
};

export const MarkerLayer = ({
  map,
  libraries,
  selectedLibraryId,
  onMarkerClick
}: MarkerLayerProps) => {
  const markersRef = useRef<Map<number, MarkerEntry>>(new Map<number, MarkerEntry>());

  useEffect(() => {
    let isCancelled = false;
    const markers = markersRef.current;

    const setupMarkers = async () => {
      try {
        const { default: mapbox } = await import('mapbox-gl');

        if (isCancelled) {
          return;
        }

        markers.forEach(({ marker, handleClick }) => {
          const element = marker.getElement();
          element.removeEventListener('click', handleClick);
          marker.remove();
        });
        markers.clear();

        libraries.forEach((library) => {
          const element = document.createElement('button');
          element.type = 'button';
          element.className = `${MARKER_BASE_CLASS} ${getMarkerVariantClass(library)} ${
            library.id === selectedLibraryId ? 'scale-110 shadow-lg' : ''
          }`;
          element.textContent = `${library.seatStatus?.available_seats ?? '-'}`;
          element.setAttribute('role', 'button');
          element.setAttribute('aria-label', getAriaLabel(library));

          const handleClick = () => {
            onMarkerClick(library.id);
            if ('vibrate' in navigator) {
              navigator.vibrate?.(10);
            }
          };

          element.addEventListener('click', handleClick);

          const marker = new mapbox.Marker({ element })
            .setLngLat([library.longitude, library.latitude])
            .addTo(map);

          markers.set(library.id, { marker, handleClick });
        });
      } catch (error) {
        console.error('Mapbox 標記載入失敗', error);
      }
    };

    void setupMarkers();

    return () => {
      isCancelled = true;
      markers.forEach(({ marker, handleClick }) => {
        const element = marker.getElement();
        element.removeEventListener('click', handleClick);
        marker.remove();
      });
      markers.clear();
    };
  }, [libraries, map, onMarkerClick, selectedLibraryId]);

  return null;
};
