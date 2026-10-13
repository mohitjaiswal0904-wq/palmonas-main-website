import { getSectionCta, getSectionDisplayTitle } from '@/lib/utils/cms-content';
import { parseMediaWidthSources, resolveMediaUrl } from '@/lib/utils/cms-media';
import type { CmsSection } from '@/types/cms';
import type { CmsAction, CmsMediaWidthSource } from '@/types/cms-section';

export interface CmsBannerSlide {
  id: string;
  mediaUrl: string | null;
  mediaType?: string;
  sources: CmsMediaWidthSource[];
  title: string;
  subtitle: string;
  cta: { text: string; link: string } | null;
  action: CmsAction | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapBannerSlideRecord(
  item: Record<string, unknown>,
  index: number,
  fallbackTitle: string,
): CmsBannerSlide | null {
  const sources = parseMediaWidthSources(item.sources);
  const mediaUrl = resolveMediaUrl(item) ?? resolveMediaUrl(sources[0]) ?? null;
  const title =
    (typeof item.title === 'string' && item.title.trim()) ||
    (typeof item.alt === 'string' && item.alt.trim()) ||
    fallbackTitle;
  const subtitle = typeof item.subtitle === 'string' ? item.subtitle : '';
  const cta = getSectionCta(item);
  const action =
    typeof item.action_type === 'string' || typeof item.action_value === 'string'
      ? {
          action_type: typeof item.action_type === 'string' ? item.action_type : null,
          action_value: typeof item.action_value === 'string' ? item.action_value : null,
        }
      : null;

  if (!mediaUrl && !title && !subtitle) {
    return null;
  }

  const id =
    (typeof item.id === 'string' && item.id) ||
    (typeof item.mediaId === 'string' && item.mediaId) ||
    `banner-slide-${index}`;

  return {
    id,
    mediaUrl,
    mediaType: typeof item.mediaType === 'string' ? item.mediaType : undefined,
    sources,
    title,
    subtitle,
    cta,
    action,
  };
}

function mapBannerSlideArray(items: unknown, fallbackTitle: string): CmsBannerSlide[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item, index) => mapBannerSlideRecord(item, index, fallbackTitle))
    .filter((slide): slide is CmsBannerSlide => slide !== null);
}

/**
 * Resolves one or more banner slides from CMS section content.
 *
 * @param section - CMS section with banner payload.
 * @returns Ordered slides; single-item fallback when no slide array is present.
 */
export function getBannerSlides(section: CmsSection): CmsBannerSlide[] {
  const content = isRecord(section.content) ? section.content : {};
  const fallbackTitle = getSectionDisplayTitle(section);

  for (const key of ['banners', 'slides', 'media'] as const) {
    const fromArray = mapBannerSlideArray(content[key], fallbackTitle);
    if (fromArray.length > 0) {
      return fromArray;
    }
  }

  const single = mapBannerSlideRecord(content, 0, fallbackTitle);
  return single ? [single] : [];
}
