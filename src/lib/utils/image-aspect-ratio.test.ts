import {
  formatImageAspectRatio,
  getImageDimensionsFromRecord,
  resolveImageAspectRatio,
} from '@/lib/utils/image-aspect-ratio';

describe('image-aspect-ratio', () => {
  describe('formatImageAspectRatio', () => {
    it('returns a CSS aspect-ratio string for valid dimensions', () => {
      expect(formatImageAspectRatio(800, 600)).toBe('800 / 600');
    });

    it('returns undefined for invalid dimensions', () => {
      expect(formatImageAspectRatio(0, 600)).toBeUndefined();
      expect(formatImageAspectRatio(800, -1)).toBeUndefined();
    });
  });

  describe('getImageDimensionsFromRecord', () => {
    it('reads snake_case and camelCase metadata keys', () => {
      expect(
        getImageDimensionsFromRecord({
          image_width: 1200,
          image_height: 900,
        }),
      ).toEqual({ width: 1200, height: 900 });

      expect(
        getImageDimensionsFromRecord({
          imageWidth: '640',
          imageHeight: '480',
        }),
      ).toEqual({ width: 640, height: 480 });
    });

    it('returns undefined when dimensions are missing', () => {
      expect(getImageDimensionsFromRecord({})).toBeUndefined();
      expect(getImageDimensionsFromRecord(undefined)).toBeUndefined();
    });
  });

  describe('resolveImageAspectRatio', () => {
    it('formats dimensions into aspect ratio', () => {
      expect(resolveImageAspectRatio({ width: 400, height: 500 })).toBe('400 / 500');
    });
  });
});
