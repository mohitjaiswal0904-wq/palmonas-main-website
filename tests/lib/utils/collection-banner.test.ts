import { hasCollectionBannerImage } from '@/lib/utils/collection-banner';

describe('hasCollectionBannerImage', () => {
  it('returns true for a non-empty banner URL', () => {
    expect(hasCollectionBannerImage({ image: 'https://cdn.example/banner.jpg' })).toBe(true);
  });

  it('returns true when the URL has surrounding whitespace', () => {
    expect(hasCollectionBannerImage({ image: '  https://cdn.example/banner.jpg  ' })).toBe(true);
  });

  it('returns false when image is undefined', () => {
    expect(hasCollectionBannerImage({})).toBe(false);
  });

  it('returns false when image is empty', () => {
    expect(hasCollectionBannerImage({ image: '' })).toBe(false);
  });

  it('returns false when image is whitespace', () => {
    expect(hasCollectionBannerImage({ image: '   ' })).toBe(false);
  });
});
