import { parseMediaWidthSources, resolveMediaAlt, resolveMediaUrl } from '@/lib/utils/cms-media';
import type { CmsSection } from '@/types/cms';
import type { CmsMediaWidthSource } from '@/types/cms-section';

export function getSectionTitle(section: CmsSection, fallback: string): string {
  return section.title ?? fallback;
}

export interface CmsSectionMediaContent {
  mediaUrl: string;
  mediaType: string;
  alt: string;
  aspectRatio?: string;
  sources: CmsMediaWidthSource[];
  thumbnailUrl?: string;
}

export function getSectionMediaContent(section: CmsSection): CmsSectionMediaContent | null {
  const { content } = section;

  if (!content) {
    return null;
  }

  const mediaUrl = resolveMediaUrl(content);
  const sources = parseMediaWidthSources(content.sources);
  const firstSourceUrl = sources.map((source) => resolveMediaUrl(source)).find(Boolean) ?? null;

  if (!mediaUrl && !firstSourceUrl) {
    return null;
  }

  const mediaType = typeof content.mediaType === 'string' ? content.mediaType : 'image';
  const aspectRatio = typeof content.aspectRatio === 'string' ? content.aspectRatio : undefined;
  const thumbnailUrl = typeof content.thumbnailUrl === 'string' ? content.thumbnailUrl : undefined;

  return {
    mediaUrl: mediaUrl ?? firstSourceUrl ?? '',
    mediaType,
    alt: resolveMediaAlt(content, section.title ?? ''),
    aspectRatio,
    sources,
    thumbnailUrl,
  };
}

export function getSectionBody(section: CmsSection): string | null {
  const { content } = section;

  if (!content) {
    return null;
  }

  if (typeof content === 'string') {
    return content;
  }

  const text = content.text ?? content.html ?? content.body;
  return typeof text === 'string' ? text : null;
}
