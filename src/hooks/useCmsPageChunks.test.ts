import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

import { useCmsPageChunks } from '@/hooks/useCmsPageChunks';
import { getCmsPageChunk } from '@/services/cms-page.service';
import type { CmsSection } from '@/types/cms';
import type { CmsPageChunkResponse } from '@/types/cms-page';

jest.mock('@/services/cms-page.service', () => ({
  getCmsPageChunk: jest.fn(),
}));

const getCmsPageChunkMock = getCmsPageChunk as jest.MockedFunction<typeof getCmsPageChunk>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const section = (id: string, order: number): CmsSection => ({
  id,
  type: 'hero',
  order,
  is_visible: true,
  content: {},
});

describe('useCmsPageChunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial sections and fetches remaining chunks', async () => {
    getCmsPageChunkMock.mockResolvedValue({
      page: { slug: 'home' },
      version: { version_number: 1, environment: 'production' },
      environment: 'production',
      chunk_ids: [2],
      sections: [section('chunk-2', 1)],
    } as CmsPageChunkResponse);

    const { result } = renderHook(
      () =>
        useCmsPageChunks({
          slug: 'home',
          chunkIds: [1, 2],
          initialChunkId: 1,
          initialSections: [section('chunk-1', 0)],
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.sections).toEqual([section('chunk-1', 0)]);
    expect(result.current.isLoadingChunks).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingChunks).toBe(false);
    });

    expect(getCmsPageChunkMock).toHaveBeenCalledWith('home', 2);
    expect(result.current.sections).toEqual([section('chunk-1', 0), section('chunk-2', 1)]);
  });
});
