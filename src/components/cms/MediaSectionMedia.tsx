'use client';

/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */

import { CmsResponsiveVideo } from '@/components/cms/shared/CmsResponsiveVideo';
import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import { useImageIntrinsicAspectRatio } from '@/hooks/useImageIntrinsicAspectRatio';
import {
  encodeCmsMediaUrl,
  isVideoMedia,
  mediaQueryForWidthSource,
  resolveMediaUrl,
} from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import type { CmsMediaWidthSource } from '@/types/cms-section';

interface MediaSectionMediaProps {
  url: string;
  mediaType?: string;
  alt?: string;
  controls?: boolean;
  sources?: CmsMediaWidthSource[];
  aspectRatio?: string;
  poster?: string;
}

/**
 * Render a media-section asset with optional CMS width-bounded `sources[]`.
 */
export function MediaSectionMedia({
  url,
  mediaType,
  alt = '',
  controls = false,
  sources = [],
  aspectRatio: contentAspectRatio,
  poster,
}: MediaSectionMediaProps) {
  const encodedUrl = encodeCmsMediaUrl(url);
  const encodedPoster = poster ? encodeCmsMediaUrl(poster) : undefined;
  const { aspectRatio: intrinsicAspectRatio, onImageLoad } =
    useImageIntrinsicAspectRatio(encodedUrl);
  const hasSources = sources.length > 0;
  const primaryIsVideo = isVideoMedia(mediaType, url);
  const sourceHasVideo = sources.some((source) => {
    const src = resolveMediaUrl(source);

    return Boolean(src && isVideoMedia(source.mediaType, src));
  });

  if (primaryIsVideo || sourceHasVideo) {
    if (hasSources) {
      return (
        <CmsResponsiveVideo
          url={encodedUrl}
          sources={sources}
          mediaType={mediaType}
          alt={alt}
          className="h-auto w-full"
          autoPlay
          controls={controls}
          poster={encodedPoster}
        />
      );
    }

    return (
      <SilentVideo
        src={encodedUrl}
        poster={encodedPoster}
        autoPlay
        loop
        controls={controls}
        preload="none"
        className="h-auto w-full"
        aria-label={alt || undefined}
      />
    );
  }

  const aspectRatio = contentAspectRatio ?? intrinsicAspectRatio;
  const imgClassName = cn('block h-auto  max-w-full object-contain', !aspectRatio && 'min-h-60');
  const imgStyle = aspectRatio ? { aspectRatio } : undefined;

  if (!hasSources) {
    return (
      <img
        src={encodedUrl}
        alt={alt}
        onLoad={onImageLoad}
        className={imgClassName}
        style={imgStyle}
      />
    );
  }

  return (
    <picture>
      {sources.map((source, index) => {
        const src = resolveMediaUrl(source);

        if (!src) {
          return null;
        }

        const encodedSrc = encodeCmsMediaUrl(src);

        return (
          <source
            key={source.mediaId ?? `${encodedSrc}-${index}`}
            media={mediaQueryForWidthSource(source)}
            srcSet={encodedSrc}
          />
        );
      })}
      <img
        src={encodedUrl}
        alt={alt || sources[0]?.alt || ''}
        onLoad={onImageLoad}
        className={imgClassName}
        style={imgStyle}
      />
    </picture>
  );
}
