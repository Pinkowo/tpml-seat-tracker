import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { LibraryWithSeat } from '@/types/library';
import { LibraryCard } from './LibraryCard';
import { SortToggle } from './SortToggle';
import { LocationPrompt } from './LocationPrompt';

export type SortOption = 'distance' | 'seats';

interface LibraryListProps {
  libraries: LibraryWithSeat[];
  selectedLibraryId: number | null;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onSelectLibrary: (libraryId: number) => void;
  isRefreshing: boolean;
  showLocationPrompt: boolean;
  onRequestLocation: () => void;
}

type SheetState = 'collapsed' | 'expanded';

export const LibraryList = ({
  libraries,
  selectedLibraryId,
  sortBy,
  onSortChange,
  onSelectLibrary,
  isRefreshing,
  showLocationPrompt,
  onRequestLocation
}: LibraryListProps) => {
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');

  const sortedLibraries = useMemo(() => {
    if (sortBy === 'distance') {
      return [...libraries].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }

    return [...libraries].sort((a, b) => {
      const aSeats = a.seatStatus?.available_seats ?? -1;
      const bSeats = b.seatStatus?.available_seats ?? -1;
      return bSeats - aSeats;
    });
  }, [libraries, sortBy]);

  const toggleSheet = () => {
    setSheetState((prev) => (prev === 'collapsed' ? 'expanded' : 'collapsed'));
  };

  const handleSelect = (libraryId: number) => {
    setSheetState('expanded');
    onSelectLibrary(libraryId);
  };

  return (
    <section
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-30 mx-auto w-full max-w-3xl px-4 transition-transform duration-300 sm:right-6 sm:left-auto sm:max-w-sm',
        {
          'translate-y-0': sheetState !== 'collapsed',
          'translate-y-[60%] sm:translate-y-0 sm:bottom-6': sheetState === 'collapsed'
        }
      )}
      aria-expanded={sheetState === 'expanded'}
      aria-busy={isRefreshing}
    >
      <div className="relative rounded-t-3xl bg-white pb-6 shadow-sheet sm:rounded-3xl">
        {isRefreshing && (
          <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-3xl bg-primary/20">
            <div className="h-full w-full animate-pulse bg-primary" />
          </div>
        )}
        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 pb-4 pt-3">
          <button
            type="button"
            onClick={toggleSheet}
            className="mx-auto h-1.5 w-12 rounded-full bg-gray-300"
            aria-label={sheetState === 'collapsed' ? '展開列表' : '收合列表'}
          />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">附近圖書館</h2>
            <SortToggle value={sortBy} onChange={onSortChange} />
          </div>
          {showLocationPrompt && sortBy === 'distance' && (
            <LocationPrompt onRequestPermission={onRequestLocation} />
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 pt-4">
          {sortedLibraries.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">目前沒有圖書館資料，請稍後再試。</p>
          ) : (
            <div className="flex flex-col gap-4 pb-6">
              {sortedLibraries.map((library) => (
                <LibraryCard
                  key={library.id}
                  library={library}
                  isActive={library.id === selectedLibraryId}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
