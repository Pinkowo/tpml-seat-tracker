import { render, waitFor, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery, focusManager } from '@tanstack/react-query';
import { describe, it, expect, vi, afterEach } from 'vitest';

const originalVisibilityDescriptor = Object.getOwnPropertyDescriptor(
  document,
  'visibilityState'
);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 10 * 60 * 1000,
        refetchInterval: 10 * 60 * 1000,
        refetchIntervalInBackground: true
      }
    }
  });

const PollingComponent = ({ onFetch }: { onFetch: () => void }) => {
  useQuery({
    queryKey: ['polling-test'],
    queryFn: async () => {
      onFetch();
      return 'ok';
    }
  });

  return null;
};

describe('Query polling interval', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    if (originalVisibilityDescriptor) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityDescriptor);
    }
  });

  it('refetches queries every 10 minutes', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const fetchSpy = vi.fn();
    const queryClient = createTestQueryClient();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible'
    });

    render(
      <QueryClientProvider client={queryClient}>
        <PollingComponent onFetch={fetchSpy} />
      </QueryClientProvider>
    );

    focusManager.setFocused(true);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const query = queryClient.getQueryCache().find({ queryKey: ['polling-test'] });
    const interval =
      typeof query?.options.refetchInterval === 'function'
        ? query.options.refetchInterval(query.state.data, query)
        : query?.options.refetchInterval;

    expect(interval).toBe(10 * 60 * 1000);

    queryClient.clear();
    setTimeoutSpy.mockRestore();
  }, 10000);
});
