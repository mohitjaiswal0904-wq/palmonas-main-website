/**
 * Client-only — uses @/lib/api.
 * SSR pages: @/services/server/cms.service.server
 */
import { pageIds } from '@/config/components.config';
import { api } from '@/lib/api';
import { toWebCmsPageSlug } from '@/lib/cms/cms-page-slug';
import { normaliseError } from '@/lib/errors';
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

export async function getPageSections(slug: string): Promise<CmsSection[]> {
  try {
    const webSlug = toWebCmsPageSlug(slug);
    const { data } = await api.get<ApiResponse<CmsPageApiResponse>>(
      `/api/v1/cms/pages/slug/${webSlug}/app`,
      { params: { platform: 'web' } },
    );
    return getSectionsFromResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getHomeSections(): Promise<CmsSection[]> {
  try {
    const { data } = await api.get<ApiResponse<CmsPageApiResponse>>(
      `/api/v1/cms/pages/slug/${pageIds.home}/app`,
      {
        params: { platform: 'web' },
      },
    );
    return getSectionsFromResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
