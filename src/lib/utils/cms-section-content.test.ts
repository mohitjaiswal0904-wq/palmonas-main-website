import { getSectionMediaContent, getSectionTitle } from '@/lib/utils/cms-section-content';
import type { CmsSection } from '@/types/cms';

describe('getSectionMediaContent', () => {
  it('returns mediaUrl and mediaType from section content', () => {
    const section: CmsSection = {
      id: '1',
      type: 'media',
      order: 1,
      is_visible: true,
      content: {
        mediaUrl: 'https://example.com/image.jpg',
        mediaType: 'image',
      },
    };

    expect(getSectionMediaContent(section)).toEqual({
      mediaUrl: 'https://example.com/image.jpg',
      mediaType: 'image',
      alt: '',
      sources: [],
      aspectRatio: undefined,
      thumbnailUrl: undefined,
    });
  });

  it('defaults mediaType to image when omitted', () => {
    const section: CmsSection = {
      id: '1',
      type: 'media',
      order: 1,
      is_visible: true,
      content: {
        mediaUrl: 'https://example.com/image.jpg',
      },
    };

    expect(getSectionMediaContent(section)?.mediaType).toBe('image');
  });

  it('includes resolved width sources and aspect ratio', () => {
    const section: CmsSection = {
      id: '1',
      type: 'media',
      order: 1,
      is_visible: true,
      content: {
        mediaUrl: 'https://example.com/fallback.jpg',
        aspectRatio: '16/9',
        sources: [
          { mediaId: 'm', maxWidth: 767, url: 'https://example.com/mobile.webp' },
          { mediaId: 'd', minWidth: 768, url: 'https://example.com/desktop.webp' },
        ],
      },
    };

    const media = getSectionMediaContent(section);

    expect(media?.aspectRatio).toBe('16/9');
    expect(media?.sources).toHaveLength(2);
    expect(media?.sources[0]?.url).toBe('https://example.com/mobile.webp');
  });

  it('uses a source url when the fallback mediaUrl is missing', () => {
    const section: CmsSection = {
      id: '1',
      type: 'media',
      order: 1,
      is_visible: true,
      content: {
        sources: [{ mediaId: 'm', maxWidth: 767, url: 'https://example.com/mobile.webp' }],
      },
    };

    expect(getSectionMediaContent(section)?.mediaUrl).toBe('https://example.com/mobile.webp');
  });
});

describe('getSectionTitle', () => {
  it('falls back when title is missing', () => {
    const section: CmsSection = { id: '1', type: 'media', order: 1, is_visible: true };

    expect(getSectionTitle(section, 'Media')).toBe('Media');
  });
});
