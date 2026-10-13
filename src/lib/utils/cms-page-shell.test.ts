import { getFirstShellChunkId, hasShellChunks } from '@/lib/utils/cms-page-shell';
import type { CmsPageShellResponse } from '@/types/cms-page';

describe('cms page shell chunk helpers', () => {
  const emptyShell: CmsPageShellResponse = {
    page: {
      id: 'page-1',
      slug: 'home-page',
      name: 'home',
      is_active: true,
    },
    version: {
      id: 'version-1',
      version_number: 1,
      environment: 'production',
    },
    layouts: {
      announcement_bars: [],
      header: null,
      footer: null,
      bottom_nav: null,
    },
    chunks: {
      chunk_ids: [],
      total_chunks: 0,
      total_sections: 0,
      manifest: [],
    },
  };

  it('detects when shell has no chunks', () => {
    expect(hasShellChunks(emptyShell)).toBe(false);
    expect(getFirstShellChunkId(emptyShell)).toBeNull();
  });

  it('returns first chunk id when manifest has chunks', () => {
    const shell: CmsPageShellResponse = {
      ...emptyShell,
      chunks: {
        chunk_ids: [1, 2],
        total_chunks: 2,
        total_sections: 4,
        manifest: [],
      },
    };

    expect(hasShellChunks(shell)).toBe(true);
    expect(getFirstShellChunkId(shell)).toBe(1);
  });
});
