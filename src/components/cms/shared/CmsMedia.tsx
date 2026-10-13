/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */
import { CmsResponsiveVideo } from '@/components/cms/shared/CmsResponsiveVideo';
import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import {
  encodeCmsMediaUrl,
  isVideoMedia,
  mediaQueryForWidthSource,
  resolveMediaUrl,
} from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import type { CmsMediaWidthSource } from '@/types/cms-section';

interface CmsMediaProps {
  url: string;
  mediaType?: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  controls?: boolean;
  /** Use `eager` for above-the-fold LCP slides; default is lazy. */
  loading?: 'lazy' | 'eager';
  sources?: CmsMediaWidthSource[];
  aspectRatio?: string;
  poster?: string;
}

/**
 * Render CMS image or video, preferring `<picture>` when width-bounded sources exist.
 */
export function CmsMedia({
  url,
  mediaType,
  alt = '',
  className,
  videoClassName,
  autoPlay = false,
  controls = false,
  loading = 'lazy',
  sources = [],
  aspectRatio,
  poster,
}: CmsMediaProps) {
  const encodedUrl = encodeCmsMediaUrl(url);
  const encodedPoster = poster ? encodeCmsMediaUrl(poster) : undefined;
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
          className={videoClassName ?? className}
          autoPlay={autoPlay}
          controls={controls}
          poster={encodedPoster}
        />
      );
    }

    return (
      <SilentVideo
        src={encodedUrl}
        poster={encodedPoster}
        loop={autoPlay}
        autoPlay={autoPlay}
        controls={controls}
        preload={loading === 'eager' ? 'metadata' : 'none'}
        className={cn('h-full w-full object-cover', videoClassName ?? className)}
        aria-label={alt || undefined}
      />
    );
  }

  const style = aspectRatio ? ({ aspectRatio } as const) : undefined;

  if (!hasSources) {
    return (
      <img
        src={encodedUrl}
        alt={alt}
        className={cn('h-full w-full object-cover', className)}
        style={style}
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
        className={cn('h-full w-full object-cover', className)}
        style={style}
      />
    </picture>
  );
}
