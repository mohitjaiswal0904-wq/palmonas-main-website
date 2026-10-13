'use client';

import { useCallback, useState, type SyntheticEvent } from 'react';

import {
  resolveImageAspectRatio,
  type ImageIntrinsicDimensions,
} from '@/lib/utils/image-aspect-ratio';

interface UseImageIntrinsicAspectRatioResult {
  aspectRatio: string | undefined;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
}

export function useImageIntrinsicAspectRatio(
  src: string | undefined,
  initialDimensions?: ImageIntrinsicDimensions,
): UseImageIntrinsicAspectRatioResult {
  const [loadedAspectRatio, setLoadedAspectRatio] = useState<
    { src: string | undefined; ratio: string } | undefined
  >();

  const dimensionAspectRatio = resolveImageAspectRatio(initialDimensions);
  const loadedForCurrentSrc =
    loadedAspectRatio != null && loadedAspectRatio.src === src
      ? loadedAspectRatio.ratio
      : undefined;
  const aspectRatio = loadedForCurrentSrc ?? dimensionAspectRatio;

  const onImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = event.currentTarget;
      const ratio = resolveImageAspectRatio({ width: naturalWidth, height: naturalHeight });

      if (ratio) {
        setLoadedAspectRatio({ src, ratio });
      }
    },
    [src],
  );

  return { aspectRatio, onImageLoad };
}
