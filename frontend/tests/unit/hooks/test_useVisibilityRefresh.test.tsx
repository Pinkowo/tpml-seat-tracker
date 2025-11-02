import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { useVisibilityRefresh } from '@/hooks/useVisibilityRefresh';

const setVisibilityState = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state
  });
};

describe('useVisibilityRefresh', () => {
  let queryClient: QueryClient;
  const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');

  beforeEach(() => {
    queryClient = new QueryClient();
    setVisibilityState('visible');
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
    if (originalDescriptor) {
      Object.defineProperty(document, 'visibilityState', originalDescriptor);
    }
  });

  it('pauses polling when hidden and resumes on visible with refetch', async () => {
    const focusSpy = vi.spyOn(focusManager, 'setFocused');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    renderHook(() => useVisibilityRefresh(), { wrapper });

    setVisibilityState('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(focusSpy).toHaveBeenLastCalledWith(false);

    setVisibilityState('visible');
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => {
      expect(focusSpy).toHaveBeenLastCalledWith(true);
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
