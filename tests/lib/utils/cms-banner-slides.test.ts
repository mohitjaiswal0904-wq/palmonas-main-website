import { getBannerSlides } from '@/lib/utils/cms-banner-slides';
import type { CmsSection } from '@/types/cms';

describe('getBannerSlides', () => {
  it('maps a banners array into slide records', () => {
    const section: CmsSection = {
      id: 'banner-1',
      type: 'banner',
      order: 1,
      is_visible: true,
      title: 'Section title',
      content: {
        banners: [
          {
            id: 'b1',
            imageUrl: 'https://cdn.example.com/a.jpg',
            title: 'First',
            subtitle: 'Sub A',
            cta: { text: 'Shop', link: '/collections/rings' },
          },
          {
            id: 'b2',
            url: 'https://cdn.example.com/b.jpg',
            title: 'Second',
          },
        ],
      },
    };

    const slides = getBannerSlides(section);

    expect(slides).toHaveLength(2);
    expect(slides[0]).toMatchObject({
      id: 'b1',
      mediaUrl: 'https://cdn.example.com/a.jpg',
      title: 'First',
      subtitle: 'Sub A',
      cta: { text: 'Shop', link: '/collections/rings' },
    });
    expect(slides[1]?.mediaUrl).toBe('https://cdn.example.com/b.jpg');
  });

  it('falls back to root content when no slide array exists', () => {
    const section: CmsSection = {
      id: 'banner-2',
      type: 'banner',
      order: 1,
      is_visible: true,
      title: 'Hero',
      content: {
        url: 'https://cdn.example.com/solo.jpg',
        subtitle: 'Limited offer',
        cta: { text: 'Browse', link: '/offers' },
      },
    };

    const slides = getBannerSlides(section);

    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({
      mediaUrl: 'https://cdn.example.com/solo.jpg',
      title: 'Hero',
      subtitle: 'Limited offer',
      cta: { text: 'Browse', link: '/offers' },
    });
  });

  it('reads media arrays used by carousel sections', () => {
    const section: CmsSection = {
      id: 'banner-3',
      type: 'banner',
      order: 1,
      is_visible: true,
      content: {
        media: [{ mediaId: 'm1', url: 'https://cdn.example.com/1.jpg', alt: 'Slide one' }],
      },
    };

    expect(getBannerSlides(section)[0]?.title).toBe('Slide one');
  });

  it('returns an empty list when content has no renderable banner data', () => {
    const section: CmsSection = {
      id: 'banner-4',
      type: 'banner',
      order: 1,
      is_visible: true,
      content: {},
    };

    expect(getBannerSlides(section)).toEqual([]);
  });
});
