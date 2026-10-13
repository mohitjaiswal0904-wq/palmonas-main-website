import 'server-only';

import { pageIds } from '@/config/components.config';
import { toWebCmsPageSlug } from '@/lib/cms/cms-page-slug';
import { normaliseError } from '@/lib/errors';
import { createPublicServerApi } from '@/lib/server-api';
import type { ApiResponse } from '@/types/api';
import type { CmsSection } from '@/types/cms';

interface CmsPageApiResponse {
  sections?: CmsSection[];
}

function getSectionsFromResponse(
  raw: ApiResponse<CmsPageApiResponse> | CmsSection[],
): CmsSection[] {
  if (Array.isArray(raw)) {
    return raw;
  }

  return raw.data.sections ?? [];
}

/**
 * Fetches CMS page sections for a slug using the public server client (no cookies).
 * Public page SSR must not call `cookies()` or the document becomes uncacheable.
 *
 * @param slug - CMS page slug.
 * @returns Normalised CMS sections.
 * @throws Normalised app error when the request fails.
 */
export async function getPageSections(slug: string): Promise<CmsSection[]> {
  try {
    const client = createPublicServerApi();
    const webSlug = toWebCmsPageSlug(slug);
    const { data } = await client.get<ApiResponse<CmsPageApiResponse>>(
      `/api/v1/cms/pages/slug/${webSlug}/app`,
      { params: { platform: 'web' } },
    );
    return getSectionsFromResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches home CMS sections using the public server client (no cookies).
 *
 * @returns Normalised CMS sections for the home page.
 * @throws Normalised app error when the request fails.
 */
export async function getHomeSections(): Promise<CmsSection[]> {
  try {
    const client = createPublicServerApi();
    const { data } = await client.get<ApiResponse<CmsPageApiResponse>>(
      `/api/v1/cms/pages/slug/${pageIds.home}/app`,
      { params: { platform: 'web' } },
    );
    return getSectionsFromResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
