import type { CmsSection } from '@/types/cms';

export function getVisibleOrderedSections(sections: CmsSection[]): CmsSection[] {
  return [...sections]
    .filter((section) => section.is_visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function mergeChunkSections(
  chunkIds: number[],
  sectionsByChunk: Partial<Record<number, CmsSection[]>>,
): CmsSection[] {
  const merged = chunkIds.flatMap((chunkId) => sectionsByChunk[chunkId] ?? []);
  return getVisibleOrderedSections(merged);
}
