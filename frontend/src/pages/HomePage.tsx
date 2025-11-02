import { useMemo, useState } from 'react';
import { MapView } from '@/components/map/MapView';
import { InfoFooter } from '@/components/info-footer/InfoFooter';
import { LibraryDetail } from '@/components/library-detail/LibraryDetail';
import { LibraryList, type SortOption } from '@/components/library-list/LibraryList';
import { RefreshButton } from '@/components/RefreshButton';
import { StaleDataWarning } from '@/components/StaleDataWarning';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useVisibilityRefresh } from '@/hooks/useVisibilityRefresh';
import type { LibraryWithSeat } from '@/types/library';

const getLatestUpdatedAt = (libraries: LibraryWithSeat[]) => {
  const timestamps = libraries
    .map((library) => library.seatStatus?.updated_at)
    .filter((value): value is string => Boolean(value));

  if (!timestamps.length) {
    return undefined;
  }

  return timestamps.sort().at(-1);
};

const getOldestUpdatedAt = (libraries: LibraryWithSeat[]) => {
  const timestamps = libraries
    .map((library) => library.seatStatus?.updated_at)
    .filter((value): value is string => Boolean(value));

  if (!timestamps.length) {
    return undefined;
  }

  return timestamps.sort().at(0);
};

const HomePage = () => {
  const [selectedLibraryId, setSelectedLibraryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const geolocation = useGeolocation();
  const { libraries, isLoading, isFetching, isError, error, refetch } = useLibraryData(
    geolocation.location ?? undefined
  );

  useVisibilityRefresh();

  const lastUpdated = useMemo(() => getLatestUpdatedAt(libraries), [libraries]);
  const oldestUpdated = useMemo(() => getOldestUpdatedAt(libraries), [libraries]);
  const selectedLibrary = useMemo(
    () => libraries.find((library) => library.id === selectedLibraryId) ?? null,
    [libraries, selectedLibraryId]
  );
  const needsLocationPrompt = Boolean(geolocation.error);
  const isRefreshing = !isLoading && isFetching;

  const handleSelectLibrary = (libraryId: number) => {
    setSelectedLibraryId(libraryId);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const hasGeoError = Boolean(geolocation.error);
  const geolocationMessage = geolocation.error ?? '為你推薦附近的圖書館座位狀況';

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#E8EFF1]">
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex justify-center p-6">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm shadow ${
                hasGeoError
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-transparent bg-white/90 text-gray-600'
              }`}
              role="status"
              aria-live="polite"
            >
              {hasGeoError && (
                <span className="inline-flex h-2 w-2 rounded-full bg-red-400" aria-hidden="true" />
              )}
              <span>{geolocationMessage}</span>
            </div>
            <RefreshButton className="shadow" onAfterRefresh={refetch} />
          </div>
          <StaleDataWarning lastUpdated={oldestUpdated} />
        </div>
      </header>

      <main className="relative flex-1">
        <MapView
          libraries={libraries}
          selectedLibraryId={selectedLibraryId}
          onMarkerClick={handleSelectLibrary}
          userLocation={geolocation.location}
          focusLibrary={selectedLibrary}
        />

        {(isLoading || geolocation.loading) && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/40 border-t-primary" />
          </div>
        )}

        {isError && (
          <div className="absolute bottom-6 left-1/2 z-20 w-full max-w-md -translate-x-1/2 rounded-2xl bg-red-500/95 px-4 py-3 text-center text-sm text-white shadow-lg">
            無法載入座位資訊：{(error as Error)?.message ?? '請稍後再試'}
          </div>
        )}

        <InfoFooter lastUpdated={lastUpdated} />
        <LibraryDetail
          open={Boolean(selectedLibrary)}
          library={selectedLibrary}
          onClose={() => setSelectedLibraryId(null)}
        />
        <LibraryList
          libraries={libraries}
          selectedLibraryId={selectedLibraryId}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onSelectLibrary={handleSelectLibrary}
          isRefreshing={isRefreshing}
          showLocationPrompt={needsLocationPrompt}
          onRequestLocation={geolocation.retry}
        />
      </main>
    </div>
  );
};

export default HomePage;
