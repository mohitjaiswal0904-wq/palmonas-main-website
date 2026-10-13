import type { CmsMediaItem, CmsMediaWidthSource } from '@/types/cms-section';

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|mov)(\?|$)/i;

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSION_PATTERN.test(url);
}

export function isVideoMedia(mediaType: string | undefined, url: string): boolean {
  return mediaType === 'video' || isVideoUrl(url);
}

export function resolveMediaUrl(
  source: Record<string, unknown> | CmsMediaItem | undefined,
): string | null {
  if (!source) {
    return null;
  }

  const candidates = [source.url, source.mediaUrl, source.imageUrl, source.thumbnailUrl];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
}

/**
 * Encode a CMS CDN URL so spaces/special chars are safe in `src` and especially `srcset`
 * (unencoded spaces terminate a srcset URL and force the fallback `<img>`).
 *
 * @param url - Raw media URL from the CMS API
 * @returns URL with pathname segments percent-encoded
 */
export function encodeCmsMediaUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname
      .split('/')
      .map((segment) => {
        if (!segment) {
          return segment;
        }

        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join('/');

    return parsed.toString();
  } catch {
    return url.replace(/ /g, '%20');
  }
}

export function resolveMediaAlt(
  source: Record<string, unknown> | undefined,
  fallback = '',
): string {
  if (!source) {
    return fallback;
  }

  const alt = source.alt ?? source.altText;

  return typeof alt === 'string' && alt.length > 0 ? alt : fallback;
}

/**
 * Parse CMS v2 `sources[]` width variants from an unknown API field.
 *
 * @param value - Raw `sources` array from section or layout metadata
 * @returns Sanitized width sources (entries without a resolvable URL are kept if they have bounds)
 */
export function parseMediaWidthSources(value: unknown): CmsMediaWidthSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sources: CmsMediaWidthSource[] = [];

  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      continue;
    }

    const record = entry as Record<string, unknown>;
    const minWidth = typeof record.minWidth === 'number' ? record.minWidth : undefined;
    const maxWidth = typeof record.maxWidth === 'number' ? record.maxWidth : undefined;

    if (minWidth == null && maxWidth == null) {
      continue;
    }

    sources.push({
      mediaId: typeof record.mediaId === 'string' ? record.mediaId : undefined,
      minWidth,
      maxWidth,
      key: typeof record.key === 'string' ? record.key : undefined,
      url: typeof record.url === 'string' ? record.url : undefined,
      imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : undefined,
      thumbnailUrl: typeof record.thumbnailUrl === 'string' ? record.thumbnailUrl : undefined,
      mediaType: typeof record.mediaType === 'string' ? record.mediaType : undefined,
      alt: typeof record.alt === 'string' ? record.alt : undefined,
      width: typeof record.width === 'number' ? record.width : undefined,
      height: typeof record.height === 'number' ? record.height : undefined,
    });
  }

  return sources;
}

/**
 * Build a CSS media query for a width-bounded CMS source.
 *
 * @param source - Width source with optional inclusive min/max bounds
 * @returns Media query string, or undefined when neither bound is set
 */
export function mediaQueryForWidthSource(source: CmsMediaWidthSource): string | undefined {
  const parts: string[] = [];

  if (source.minWidth != null) {
    parts.push(`(min-width: ${source.minWidth}px)`);
  }

  if (source.maxWidth != null) {
    parts.push(`(max-width: ${source.maxWidth}px)`);
  }

  return parts.length > 0 ? parts.join(' and ') : undefined;
}

export interface PickableMediaContent {
  mediaId?: string | null;
  url?: string | null;
  mediaUrl?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  mediaType?: string | null;
  alt?: string | null;
  sources?: CmsMediaWidthSource[] | null;
}

/**
 * Pick the best CMS media variant for a viewport width, falling back to the default asset.
 *
 * @param content - Fallback media fields plus optional `sources[]`
 * @param viewportWidth - Current viewport width in CSS pixels
 * @returns Matched source or a synthetic fallback source
 */
export function pickMediaSource(
  content: PickableMediaContent,
  viewportWidth: number,
): CmsMediaWidthSource {
  const match = (content.sources ?? []).find((source) => {
    const minOk = source.minWidth == null || viewportWidth >= source.minWidth;
    const maxOk = source.maxWidth == null || viewportWidth <= source.maxWidth;

    return minOk && maxOk;
  });

  if (match && (match.url || match.imageUrl)) {
    return match;
  }

  const fallbackUrl = content.url ?? content.mediaUrl ?? content.imageUrl ?? undefined;

  return {
    mediaId: content.mediaId ?? undefined,
    url: fallbackUrl ?? undefined,
    imageUrl: content.imageUrl ?? content.url ?? content.mediaUrl ?? undefined,
    thumbnailUrl: content.thumbnailUrl ?? undefined,
    mediaType: content.mediaType ?? undefined,
    alt: content.alt ?? undefined,
  };
}

/**
 * Resolve layout chrome image sources from top-level or `extra_metadata` fields.
 *
 * @param item - Layout item fields that may carry `image_sources`
 * @returns Parsed width sources
 */
export function resolveLayoutImageSources(item: {
  image_sources?: CmsMediaWidthSource[] | null;
  extra_metadata?: Record<string, unknown> | null;
}): CmsMediaWidthSource[] {
  if (item.image_sources?.length) {
    return item.image_sources;
  }

  return parseMediaWidthSources(item.extra_metadata?.image_sources);
}

/**
 * Resolve layout chrome icon sources from top-level or `extra_metadata` fields.
 *
 * @param item - Layout item fields that may carry `icon_sources`
 * @returns Parsed width sources
 */
export function resolveLayoutIconSources(item: {
  icon_sources?: CmsMediaWidthSource[] | null;
  extra_metadata?: Record<string, unknown> | null;
}): CmsMediaWidthSource[] {
  if (item.icon_sources?.length) {
    return item.icon_sources;
  }

  return parseMediaWidthSources(item.extra_metadata?.icon_sources);
}
