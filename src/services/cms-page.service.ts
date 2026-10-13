/**
 * Client-only — lazy CMS page chunk loading.
 * SSR: @/services/server/cms-page.service.server
 */
import { api } from '@/lib/api';
import { toWebCmsPageSlug } from '@/lib/cms/cms-page-slug';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { CmsPageChunkResponseSchema, type CmsPageChunkResponse } from '@/types/cms-page';

const DEFAULT_PRODUCTS_PER_COLLECTION = 12;

export async function getCmsPageChunk(
  slug: string,
  chunkId: number,
  productsPerCollection = DEFAULT_PRODUCTS_PER_COLLECTION,
): Promise<CmsPageChunkResponse> {
  try {
    const webSlug = toWebCmsPageSlug(slug);
    const { data } = await api.get<unknown>(ENDPOINTS.cms.pageChunkBySlug(webSlug, chunkId), {
      params: {
        products_per_collection: productsPerCollection,
        platform: 'react-web',
      },
    });

    return CmsPageChunkResponseSchema.parse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
