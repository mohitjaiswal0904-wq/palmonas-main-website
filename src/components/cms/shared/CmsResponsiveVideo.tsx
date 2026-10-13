'use client';

/* eslint-disable @next/next/no-img-element -- CMS media uses arbitrary CDN URLs */

import { useEffect, useState } from 'react';

import { SilentVideo } from '@/components/cms/shared/SilentVideo';
import { encodeCmsMediaUrl, isVideoMedia, pickMediaSource } from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import type { CmsMediaWidthSource } from '@/types/cms-section';

interface CmsResponsiveVideoProps {
  url: string;
  sources?: CmsMediaWidthSource[];
  mediaType?: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  poster?: string;
}

/**
 * Render a CMS video, swapping `src` when width-bounded `sources[]` are present.
 */
export function CmsResponsiveVideo({
  url,
  sources = [],
  mediaType,
  alt = '',
  className,
  autoPlay = false,
  controls = false,
  poster,
}: CmsResponsiveVideoProps) {
  const [viewportWidth, setViewportWidth] = useState(1280);

  // Keep video src in sync with viewport when CMS provides width variants.
  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  const picked = pickMediaSource({ url, mediaType, sources, thumbnailUrl: poster }, viewportWidth);
  const src = encodeCmsMediaUrl(picked.url ?? picked.imageUrl ?? url);
  const resolvedPoster = picked.thumbnailUrl ?? poster;
  const encodedPoster = resolvedPoster ? encodeCmsMediaUrl(resolvedPoster) : undefined;

  if (!isVideoMedia(picked.mediaType ?? mediaType, src)) {
    return <img src={src} alt={alt} className={cn('h-full w-full object-cover', className)} />;
  }

  return (
    <SilentVideo
      src={src}
      poster={encodedPoster}
      loop={autoPlay}
      autoPlay={autoPlay}
      controls={controls}
      preload="none"
      className={cn('h-full w-full object-cover', className)}
      aria-label={alt || undefined}
    />
  );
}
