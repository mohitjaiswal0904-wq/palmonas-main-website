import 'server-only';

import { unstable_cache as cacheWithRevalidation } from 'next/cache';
import { cache } from 'react';

import { toWebCmsPageSlug } from '@/lib/cms/cms-page-slug';
import { ENDPOINTS } from '@/lib/endpoints';
import { getApiBaseUrl } from '@/lib/env';
import { normaliseError } from '@/lib/errors';
import { isNextProductionRuntime } from '@/lib/is-next-production';
import { createPublicServerApi } from '@/lib/server-api';
import {
  CmsPageChunkResponseSchema,
  CmsPageShellResponseSchema,
  type CmsPageChunkResponse,
  type CmsPageShellResponse,
} from '@/types/cms-page';

const CMS_PAGE_REVALIDATE_SECONDS = 300;
const DEFAULT_PRODUCTS_PER_COLLECTION = 12;

async function fetchCmsPageShell(slug: string): Promise<CmsPageShellResponse> {
  const client = createPublicServerApi();
  const webSlug = toWebCmsPageSlug(slug);
  const { data } = await client.get<unknown>(ENDPOINTS.cms.pageShellBySlug(webSlug), {
    params: { platform: 'web' },
  });

  return CmsPageShellResponseSchema.parse(data);
}

async function fetchCmsPageChunk(slug: string, chunkId: number): Promise<CmsPageChunkResponse> {
  const client = createPublicServerApi();
  const webSlug = toWebCmsPageSlug(slug);
  const { data } = await client.get<unknown>(ENDPOINTS.cms.pageChunkBySlug(webSlug, chunkId), {
    params: {
      products_per_collection: DEFAULT_PRODUCTS_PER_COLLECTION,
      platform: 'react-web',
    },
  });

  return CmsPageChunkResponseSchema.parse(data);
}

const getCmsPageShellRequest = cache(async (slug: string): Promise<CmsPageShellResponse> => {
  const webSlug = toWebCmsPageSlug(slug);
  if (!isNextProductionRuntime()) {
    return fetchCmsPageShell(slug);
  }

  return cacheWithRevalidation(
    async () => fetchCmsPageShell(slug),
    ['cms-page-shell', webSlug, getApiBaseUrl()],
    {
      revalidate: CMS_PAGE_REVALIDATE_SECONDS,
      tags: [`cms-page-${webSlug}`, 'cms-page-shell'],
    },
  )();
});

const getCmsPageChunkRequest = cache(
  async (slug: string, chunkId: number): Promise<CmsPageChunkResponse> => {
    const webSlug = toWebCmsPageSlug(slug);
    if (!isNextProductionRuntime()) {
      return fetchCmsPageChunk(slug, chunkId);
    }

    return cacheWithRevalidation(
      async () => fetchCmsPageChunk(slug, chunkId),
      ['cms-page-chunk', webSlug, String(chunkId), getApiBaseUrl()],
      {
        revalidate: CMS_PAGE_REVALIDATE_SECONDS,
        tags: [`cms-page-${webSlug}`, `cms-page-chunk-${webSlug}-${chunkId}`],
      },
    )();
  },
);

export async function getCmsPageShell(slug: string): Promise<CmsPageShellResponse> {
  try {
    return await getCmsPageShellRequest(slug);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getCmsPageChunk(
  slug: string,
  chunkId: number,
): Promise<CmsPageChunkResponse> {
  try {
    return await getCmsPageChunkRequest(slug, chunkId);
  } catch (err) {
    throw normaliseError(err);
  }
}
