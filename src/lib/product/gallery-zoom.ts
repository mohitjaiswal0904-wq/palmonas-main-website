/**
 * Viewport box used to keep the pointer's content point stable across a zoom.
 */
export interface GalleryZoomViewport {
  scrollLeft: number;
  scrollTop: number;
}

/**
 * Clamp a gallery zoom scale to the configured range.
 *
 * @param scale - Proposed scale.
 * @param minScale - Inclusive lower bound.
 * @param maxScale - Inclusive upper bound.
 * @returns Scale inside `[minScale, maxScale]`.
 */
export function clampGalleryScale(scale: number, minScale: number, maxScale: number): number {
  if (!Number.isFinite(scale)) {
    return minScale;
  }

  return Math.min(maxScale, Math.max(minScale, scale));
}

/**
 * Distance between two touch points for pinch-zoom.
 *
 * @param first - First touch.
 * @param second - Second touch.
 * @returns Euclidean distance in CSS pixels.
 */
export function pinchDistance(
  first: Pick<Touch, 'clientX' | 'clientY'>,
  second: Pick<Touch, 'clientX' | 'clientY'>,
): number {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

/**
 * Midpoint between two touches, used as the pinch zoom origin.
 *
 * @param first - First touch.
 * @param second - Second touch.
 * @returns Client coordinates of the pinch centre.
 */
export function pinchMidpoint(
  first: Pick<Touch, 'clientX' | 'clientY'>,
  second: Pick<Touch, 'clientX' | 'clientY'>,
): { clientX: number; clientY: number } {
  return {
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2,
  };
}

/**
 * Scroll offsets that keep the content under a pointer after the frame scale changes.
 *
 * @param input.fromScale - Scale before the zoom.
 * @param input.toScale - Scale after the zoom.
 * @param input.viewport - Current scroll box.
 * @param input.pointerOffsetX - Pointer X relative to the viewport's left edge.
 * @param input.pointerOffsetY - Pointer Y relative to the viewport's top edge.
 * @returns Next `scrollLeft` / `scrollTop`.
 */
export function scrollAfterZoomTowardPoint(input: {
  fromScale: number;
  toScale: number;
  viewport: GalleryZoomViewport;
  pointerOffsetX: number;
  pointerOffsetY: number;
}): { scrollLeft: number; scrollTop: number } {
  const { fromScale, toScale, viewport, pointerOffsetX, pointerOffsetY } = input;
  if (!(fromScale > 0) || !Number.isFinite(toScale)) {
    return { scrollLeft: viewport.scrollLeft, scrollTop: viewport.scrollTop };
  }

  const ratio = toScale / fromScale;
  const contentX = viewport.scrollLeft + pointerOffsetX;
  const contentY = viewport.scrollTop + pointerOffsetY;

  return {
    scrollLeft: contentX * ratio - pointerOffsetX,
    scrollTop: contentY * ratio - pointerOffsetY,
  };
}
