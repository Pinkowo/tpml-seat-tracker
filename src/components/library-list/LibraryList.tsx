import { useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import clsx from 'clsx';
import type { LibraryWithSeat } from '@/types/library';
import { LibraryCard } from './LibraryCard';
import { SortToggle } from './SortToggle';
export type SortOption = 'distance' | 'seats';

interface LibraryListProps {
  libraries: LibraryWithSeat[];
  selectedLibraryId: number | null;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onSelectLibrary: (libraryId: number) => void;
  isRefreshing: boolean;
}

export const LibraryList = ({
  libraries,
  selectedLibraryId,
  sortBy,
  onSortChange,
  onSelectLibrary,
  isRefreshing,
}: LibraryListProps) => {
  type DrawerState = 'collapsed' | 'expanded';
  const [drawerState, setDrawerState] = useState<DrawerState>('collapsed');
  const pointerStartYRef = useRef<number | null>(null);
  const isExpanded = drawerState === 'expanded';

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

  const setDrawer = (state: DrawerState) => {
    setDrawerState(state);
  };

  const handleToggle = () => {
    setDrawer(isExpanded ? 'collapsed' : 'expanded');
  };

  const handleSelect = (libraryId: number) => {
    setDrawer('expanded');
    onSelectLibrary(libraryId);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    pointerStartYRef.current = event.clientY;
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pointerStartYRef.current === null) {
      return;
    }

    const deltaY = event.clientY - pointerStartYRef.current;

    if (deltaY <= -40) {
      setDrawer('expanded');
    } else if (deltaY >= 40) {
      setDrawer('collapsed');
    }

    pointerStartYRef.current = null;
  };

  const handlePointerCancel = () => {
    pointerStartYRef.current = null;
  };

  return (
    <section className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div
        className={clsx(
          'pointer-events-auto mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-sheet transition-all duration-300 ease-in-out pb-8',
          isExpanded ? 'h-[90vh]' : 'h-[88px]'
        )}
      >
        <button
          type="button"
          onClick={handleToggle}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? '收合列表' : '展開列表'}
          className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
        >
          <span className="text-sm font-semibold text-gray-800 w-20">附近圖書館</span>
          <span className="h-1.5 w-16 rounded-full bg-gray-300" aria-hidden="true" />
          <span aria-hidden="true" className="text-sm font-semibold text-gray-500 w-20">
            {isExpanded ? '收合' : '展開'}
          </span>
        </button>
        {isExpanded && (
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-4 py-3">
              <SortToggle value={sortBy} onChange={onSortChange} />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3">
              {isRefreshing && (
                <div className="mb-3 h-1 rounded-full bg-primary/20">
                  <div className="h-full w-full animate-pulse rounded-full bg-primary" />
                </div>
              )}
              {sortedLibraries.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  目前沒有圖書館資料，請稍後再試。
                </p>
              ) : (
                <div className="flex flex-col gap-4">
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
        )}
      </div>
    </section>
  );
};
