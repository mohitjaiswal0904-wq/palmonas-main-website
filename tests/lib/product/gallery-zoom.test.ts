import {
  clampGalleryScale,
  pinchDistance,
  pinchMidpoint,
  scrollAfterZoomTowardPoint,
} from '@/lib/product/gallery-zoom';

describe('clampGalleryScale', () => {
  it('returns the value when it sits inside the range', () => {
    expect(clampGalleryScale(1.5, 1, 3)).toBe(1.5);
  });

  it('clamps to the maximum', () => {
    expect(clampGalleryScale(9, 1, 3)).toBe(3);
  });

  it('clamps to the minimum', () => {
    expect(clampGalleryScale(0.2, 1, 3)).toBe(1);
  });

  it('falls back to the minimum for non-finite input', () => {
    expect(clampGalleryScale(Number.NaN, 1, 3)).toBe(1);
    expect(clampGalleryScale(Number.POSITIVE_INFINITY, 1, 3)).toBe(1);
  });
});

describe('pinchDistance', () => {
  it('measures the gap between two touches', () => {
    expect(pinchDistance({ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 })).toBe(5);
  });

  it('returns zero when the touches overlap', () => {
    expect(pinchDistance({ clientX: 10, clientY: 10 }, { clientX: 10, clientY: 10 })).toBe(0);
  });
});

describe('pinchMidpoint', () => {
  it('averages two touch points', () => {
    expect(pinchMidpoint({ clientX: 0, clientY: 10 }, { clientX: 10, clientY: 20 })).toEqual({
      clientX: 5,
      clientY: 15,
    });
  });
});

describe('scrollAfterZoomTowardPoint', () => {
  it('keeps the pointer content point stable when zooming in', () => {
    expect(
      scrollAfterZoomTowardPoint({
        fromScale: 1,
        toScale: 2,
        viewport: { scrollLeft: 0, scrollTop: 0 },
        pointerOffsetX: 100,
        pointerOffsetY: 50,
      }),
    ).toEqual({ scrollLeft: 100, scrollTop: 50 });
  });

  it('leaves scroll unchanged when the from-scale is not positive', () => {
    expect(
      scrollAfterZoomTowardPoint({
        fromScale: 0,
        toScale: 2,
        viewport: { scrollLeft: 12, scrollTop: 8 },
        pointerOffsetX: 40,
        pointerOffsetY: 20,
      }),
    ).toEqual({ scrollLeft: 12, scrollTop: 8 });
  });

  it('leaves scroll unchanged when the to-scale is not finite', () => {
    expect(
      scrollAfterZoomTowardPoint({
        fromScale: 1,
        toScale: Number.NaN,
        viewport: { scrollLeft: 12, scrollTop: 8 },
        pointerOffsetX: 40,
        pointerOffsetY: 20,
      }),
    ).toEqual({ scrollLeft: 12, scrollTop: 8 });
  });
});
