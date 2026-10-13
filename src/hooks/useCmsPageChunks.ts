'use client';

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { mergeChunkSections } from '@/lib/utils/cms-sections';
import { getCmsPageChunk } from '@/services/cms-page.service';
import type { CmsSection } from '@/types/cms';

const STALE_TIME = 1000 * 60 * 5;

interface UseCmsPageChunksOptions {
  slug: string;
  chunkIds: number[];
  initialChunkId?: number;
  initialSections: CmsSection[];
}

export function useCmsPageChunks({
  slug,
  chunkIds,
  initialChunkId,
  initialSections,
}: UseCmsPageChunksOptions): {
  sections: CmsSection[];
  isLoadingChunks: boolean;
} {
  const remainingChunkIds = useMemo(
    () => chunkIds.filter((chunkId) => chunkId !== initialChunkId),
    [chunkIds, initialChunkId],
  );

  const chunkQueries = useQueries({
    queries: remainingChunkIds.map((chunkId) => ({
      queryKey: queryKeys.cms.chunk(slug, chunkId),
      queryFn: () => getCmsPageChunk(slug, chunkId),
      staleTime: STALE_TIME,
      retry: shouldRetryQuery,
    })),
  });

  const sectionsByChunk = useMemo(() => {
    const map: Partial<Record<number, CmsSection[]>> = {};

    if (initialChunkId !== undefined) {
      map[initialChunkId] = initialSections;
    }

    remainingChunkIds.forEach((chunkId, index) => {
      const sections = chunkQueries[index]?.data?.sections;

      if (sections) {
        map[chunkId] = sections;
      }
    });

    return map;
  }, [chunkQueries, initialChunkId, initialSections, remainingChunkIds]);

  const sections = useMemo(
    () => mergeChunkSections(chunkIds, sectionsByChunk),
    [chunkIds, sectionsByChunk],
  );

  const isLoadingChunks = chunkQueries.some((query) => query.isPending || query.isFetching);

  return { sections, isLoadingChunks };
}
