import type { CmsPageShellResponse } from '@/types/cms-page';

export function hasShellChunks(shell: CmsPageShellResponse): boolean {
  return shell.chunks.chunk_ids.length > 0;
}

export function getFirstShellChunkId(shell: CmsPageShellResponse): number | null {
  return shell.chunks.chunk_ids[0] ?? null;
}
