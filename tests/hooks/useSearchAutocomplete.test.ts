
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { AppError } from '@/lib/errors';
import { searchProductsList } from '@/services/search.service';
import type { Product, ProductListResponse } from '@/types/product';

jest.mock('@/services/search.service', () => ({
  searchProductsList: jest.fn(),
}));

const mockSearchProductsList = searchProductsList as jest.MockedFunction<typeof searchProductsList>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
}

/**
 * Builds a minimal product fixture for autocomplete list mocks.
 *
 * @param id - Product id and handle.
 * @returns A typed Product with required fields filled.
 */
function makeProduct(id: string): Product {
  return {
    id,
    handle: id,
    name: `Product ${id}`,
    description: '',
    price: 0,
    image: '',
    images: [],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [],
  };
}

/**
 * Builds a search products list response for the given product ids.
 *
 * @param itemIds - Product ids to include.
 * @returns Typed ProductListResponse for hook mocks.
 */
function makeListResponse(itemIds: string[]): ProductListResponse {
  return {
    items: itemIds.map(makeProduct),
    page: 1,
    total: itemIds.length,
    totalPages: 1,
    hasNext: false,
    filterGroups: [],
  };
}

describe('useSearchAutocomplete', () => {
  beforeEach(() => {
    mockSearchProductsList.mockReset();
  });

  it('does not fetch when the query is empty', () => {
    const { result } = renderHook(() => useSearchAutocomplete('   '), {
      wrapper: createWrapper(),
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockSearchProductsList).not.toHaveBeenCalled();
  });

  it('returns matching products for a query', async () => {
    mockSearchProductsList.mockResolvedValueOnce(makeListResponse(['ring-1', 'ring-2']));

    const { result } = renderHook(() => useSearchAutocomplete('gold ring'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products.map((product) => product.id)).toEqual(['ring-1', 'ring-2']);
    });

    expect(mockSearchProductsList).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'gold ring',
        limit: 6,
        page: 1,
      }),
    );
    expect(result.current.error).toBeNull();
  });

  it('exposes a normalised error when the search request fails', async () => {
    // NOT_FOUND skips shouldRetryQuery's backoff, so the error surfaces within waitFor.
    mockSearchProductsList.mockRejectedValue(new AppError('NOT_FOUND', 'Search failed', 404));

    const { result } = renderHook(() => useSearchAutocomplete('earrings'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Search failed');
    });

    expect(result.current.products).toEqual([]);
  });

  it('clears products when the query becomes empty again', async () => {
    mockSearchProductsList.mockResolvedValueOnce(makeListResponse(['a']));

    const { result, rerender } = renderHook(({ query }) => useSearchAutocomplete(query), {
      initialProps: { query: 'ring' },
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
    });

    rerender({ query: '' });

    expect(result.current.products).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
