'use client';

import { CmsSectionList } from '@/components/cms/CmsSectionList';
import { CmsSectionsLoadingSkeleton } from '@/components/cms/CmsSectionsLoadingSkeleton';
import { useCmsPageChunks } from '@/hooks/useCmsPageChunks';
import type { CmsSection } from '@/types/cms';
import type { CmsPageShellResponse } from '@/types/cms-page';

interface CmsPageBodyProps {
  slug: string;
  shell: CmsPageShellResponse;
  initialChunkId?: number;
  initialSections: CmsSection[];
}

export function CmsPageBody({ slug, shell, initialChunkId, initialSections }: CmsPageBodyProps) {
  const { sections, isLoadingChunks } = useCmsPageChunks({
    slug,
    chunkIds: shell.chunks.chunk_ids,
    initialChunkId,
    initialSections,
  });

  if (sections.length === 0 && !isLoadingChunks) {
    return null;
  }

  return (
    <>
      <CmsSectionList sections={sections} />
      {isLoadingChunks ? <CmsSectionsLoadingSkeleton sectionCount={2} /> : null}
    </>
  );
}
