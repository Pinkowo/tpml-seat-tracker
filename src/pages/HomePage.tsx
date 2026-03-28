import { useMemo, useState } from 'react';
import { MapView } from '@/components/map/MapView';
import { InfoLegend } from '@/components/info-legend/InfoLegend';
import { LibraryDetail } from '@/components/library-detail/LibraryDetail';
import { LibraryList, type SortOption } from '@/components/library-list/LibraryList';
import { LibrarySummaryCard } from '@/components/library-summary/LibrarySummaryCard';
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

const HomePage = () => {
  const [summaryLibraryId, setSummaryLibraryId] = useState<number | null>(null);
  const [detailLibraryId, setDetailLibraryId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const geolocation = useGeolocation();
  const { libraries, isLoading, isFetching, isError, error } = useLibraryData(
    geolocation.location
  );

  useVisibilityRefresh();

  const lastUpdated = useMemo(() => getLatestUpdatedAt(libraries), [libraries]);
  const summaryLibrary = useMemo(
    () => libraries.find((library) => library.id === summaryLibraryId) ?? null,
    [libraries, summaryLibraryId]
  );
  const detailLibrary = useMemo(
    () => libraries.find((library) => library.id === detailLibraryId) ?? null,
    [libraries, detailLibraryId]
  );
  const activeLibraryId = detailLibraryId ?? summaryLibraryId ?? null;

  const handleMarkerSelect = (libraryId: number) => {
    setSummaryLibraryId(libraryId);
  };

  const handleSelectLibrary = (libraryId: number) => {
    setSummaryLibraryId(null);
    setDetailLibraryId(libraryId);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const handleMapBackgroundClick = () => {
    if (detailLibraryId) {
      return;
    }

    setSummaryLibraryId(null);
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#E8EFF1]">
      <main className="relative flex-1">
        <MapView
          libraries={libraries}
          selectedLibraryId={activeLibraryId}
          onMarkerClick={handleMarkerSelect}
          userLocation={geolocation.location}
          focusLibrary={detailLibrary ?? summaryLibrary}
          onMapBackgroundClick={handleMapBackgroundClick}
        />

        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-white/60">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/40 border-t-primary" />
          </div>
        )}

        {isError && (
          <div className="absolute bottom-6 left-1/2 z-20 w-full max-w-md -translate-x-1/2 rounded-2xl bg-red-500/95 px-4 py-3 text-center text-sm text-white shadow-lg">
            無法載入座位資訊：{(error as Error)?.message ?? '請稍後再試'}
          </div>
        )}

        <div className="pointer-events-none absolute right-4 top-6 z-30 flex flex-col items-end gap-3 sm:right-6">
          <InfoLegend lastUpdated={lastUpdated} />
        </div>
        <LibraryDetail
          open={Boolean(detailLibrary)}
          library={detailLibrary}
          onClose={() => setDetailLibraryId(null)}
        />
        {summaryLibrary && !detailLibrary && (
          <LibrarySummaryCard
            library={summaryLibrary}
            onClose={() => setSummaryLibraryId(null)}
            onViewDetail={() => setDetailLibraryId(summaryLibrary.id)}
          />
        )}
        <LibraryList
          libraries={libraries}
          selectedLibraryId={activeLibraryId}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onSelectLibrary={handleSelectLibrary}
          isRefreshing={!isLoading && isFetching}
        />
      </main>
    </div>
  );
};

export default HomePage;
