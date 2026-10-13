import { createElement, type ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useAuth } from '@/hooks/auth/useAuth';
import {
  clearSearchHistoryCache,
  forcePrefetchSearchHistory,
  useSearchHistory,
} from '@/hooks/useSearchHistory';
import { AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { getSearchHistory } from '@/services/search.service';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => mockPathname),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/search.service', () => ({
  getSearchHistory: jest.fn(),
}));

let mockPathname = '/';
const mockUseAuth = useAuth as jest.Mock;
const mockGetSearchHistory = getSearchHistory as jest.MockedFunction<typeof getSearchHistory>;

function createWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client }, children);
  }

  return { Wrapper, client };
}

describe('useSearchHistory', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockGetSearchHistory.mockReset();
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
    });
  });

  it('does not fetch for guests', () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSearchHistory({ isOpen: true }), {
      wrapper: Wrapper,
    });

    expect(result.current.terms).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockGetSearchHistory).not.toHaveBeenCalled();
  });

  it('fetches recent terms when authenticated and open', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });
    mockGetSearchHistory.mockResolvedValue(['Rings', 'Diamond']);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSearchHistory({ isOpen: true }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.terms).toEqual(['Rings', 'Diamond']);
    });

    expect(result.current.error).toBeNull();
    expect(mockGetSearchHistory).toHaveBeenCalled();
  });

  it('refetches history on mount even when cache has data', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });
    mockGetSearchHistory.mockResolvedValue(['Fresh']);
    const { Wrapper, client } = createWrapper();
    client.setQueryData(queryKeys.search.history(), ['Cached']);

    renderHook(() => useSearchHistory({ isOpen: false }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(mockGetSearchHistory).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(client.getQueryData(queryKeys.search.history())).toEqual(['Fresh']);
    });
  });

  it('refetches history when the pathname changes', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });
    mockGetSearchHistory
      .mockResolvedValueOnce(['First'])
      .mockResolvedValueOnce(['Second']);
    const { Wrapper, client } = createWrapper();

    const { rerender } = renderHook(() => useSearchHistory({ isOpen: false }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(client.getQueryData(queryKeys.search.history())).toEqual(['First']);
    });

    mockPathname = '/products/rings';
    rerender();

    await waitFor(() => {
      expect(client.getQueryData(queryKeys.search.history())).toEqual(['Second']);
    });
    expect(mockGetSearchHistory).toHaveBeenCalledTimes(2);
  });

  it('exposes a normalised error when history fails', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isGuest: false,
      isLoading: false,
    });
    mockGetSearchHistory.mockRejectedValue(new AppError('SERVER_ERROR', 'History failed', 500));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSearchHistory({ isOpen: true }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe('History failed');
    });

    expect(result.current.terms).toEqual([]);
  });

  it('forcePrefetchSearchHistory clears cache and fetches fresh terms', async () => {
    mockGetSearchHistory.mockResolvedValue(['Fresh']);
    const { client } = createWrapper();
    client.setQueryData(queryKeys.search.history(), ['Cached']);

    forcePrefetchSearchHistory(client);

    await waitFor(() => {
      expect(client.getQueryData(queryKeys.search.history())).toEqual(['Fresh']);
    });

    expect(mockGetSearchHistory).toHaveBeenCalledTimes(1);
  });

  it('clearSearchHistoryCache removes history data', () => {
    const { client } = createWrapper();
    client.setQueryData(queryKeys.search.history(), ['Cached']);

    clearSearchHistoryCache(client);

    expect(client.getQueryData(queryKeys.search.history())).toBeUndefined();
  });
});
