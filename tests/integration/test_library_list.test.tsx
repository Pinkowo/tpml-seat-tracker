import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LibraryList } from '@/components/library-list/LibraryList';
import type { LibraryWithSeat } from '@/types/library';

const mockLibraries: LibraryWithSeat[] = [
  {
    id: 1,
    name: '總館',
    address: '臺北市大安區建國南路二段125號',
    latitude: 25.02607,
    longitude: 121.54044,
    distance: 450,
    seatStatus: {
      library: {
        id: 1,
        name: '總館',
        address: '臺北市大安區建國南路二段125號',
        latitude: 25.02607,
        longitude: 121.54044,
        distance: 450
      },
      available_seats: 5,
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
    distance: 3200,
    seatStatus: {
      library: {
        id: 2,
        name: '天母分館',
        address: '臺北市士林區天母西路62號',
        latitude: 25.11622,
        longitude: 121.5256,
        distance: 3200
      },
      available_seats: 12,
      total_seats: 80,
      updated_at: new Date().toISOString()
    }
  }
];

const renderList = (overrides?: Partial<React.ComponentProps<typeof LibraryList>>) => {
  const onSelectLibrary = vi.fn();
  const onSortChange = vi.fn();
  const onRequestLocation = vi.fn();

  const props: React.ComponentProps<typeof LibraryList> = {
    libraries: mockLibraries,
    selectedLibraryId: null,
    sortBy: 'distance',
    onSortChange,
    onSelectLibrary,
    isRefreshing: false,
    showLocationPrompt: false,
    onRequestLocation,
    ...overrides
  };

  const view = render(<LibraryList {...props} />);
  return { view, onSelectLibrary, onSortChange, onRequestLocation };
};

describe('LibraryList', () => {
  it('updates order when toggling sort', async () => {
    const user = userEvent.setup();
    let sortBy: 'distance' | 'seats' = 'distance';

    const Wrapper = () => (
      <LibraryList
        libraries={mockLibraries}
        selectedLibraryId={null}
        sortBy={sortBy}
        onSortChange={(value) => {
          sortBy = value;
          rerender(<Wrapper />);
        }}
        onSelectLibrary={vi.fn()}
        isRefreshing={false}
        showLocationPrompt={false}
        onRequestLocation={vi.fn()}
      />
    );

    const { rerender } = render(<Wrapper />);

    await user.click(screen.getByRole('button', { name: '展開列表' }));

    const headings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
    expect(headings[0]).toBe('總館');

    await user.click(screen.getByRole('button', { name: '依可用座位' }));

    const resortedHeadings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
    expect(resortedHeadings[0]).toBe('天母分館');
  });

  it('triggers selection callback when library card clicked', async () => {
    const user = userEvent.setup();
    const { onSelectLibrary } = renderList();

    await user.click(screen.getByRole('button', { name: '展開列表' }));
    const card = screen.getByText('天母分館').closest('button');
    expect(card).toBeTruthy();

    if (card) {
      await user.click(card);
    }

    expect(onSelectLibrary).toHaveBeenCalledWith(2);
  });

  it('shows location prompt and triggers permission request', async () => {
    const user = userEvent.setup();
    const { onRequestLocation } = renderList({ showLocationPrompt: true, sortBy: 'distance' });

    await user.click(screen.getByRole('button', { name: '展開列表' }));
    const prompt = screen.getByText('需要定位權限以使用距離排序');
    expect(prompt).toBeInTheDocument();

    const promptView = within(prompt.closest('div') as HTMLElement);
    await user.click(promptView.getByRole('button', { name: '再次請求定位' }));
    expect(onRequestLocation).toHaveBeenCalled();
  });
});
