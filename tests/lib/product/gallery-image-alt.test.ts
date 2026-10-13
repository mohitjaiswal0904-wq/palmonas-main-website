import { galleryImageAlt } from '@/lib/product/gallery-image-alt';

describe('galleryImageAlt', () => {
  it('uses the bare product name for the first slide', () => {
    expect(galleryImageAlt('Halo Necklace', 0)).toBe('Halo Necklace');
  });

  it('numbers later slides from one', () => {
    expect(galleryImageAlt('Halo Necklace', 1)).toBe('Halo Necklace - 2');
    expect(galleryImageAlt('Halo Necklace', 4)).toBe('Halo Necklace - 5');
  });

  it('keeps slides distinguishable for an unnamed product', () => {
    expect(galleryImageAlt('', 0)).toBe('');
    expect(galleryImageAlt('', 1)).toBe(' - 2');
  });
});
