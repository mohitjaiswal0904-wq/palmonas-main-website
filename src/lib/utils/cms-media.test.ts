import {
  encodeCmsMediaUrl,
  mediaQueryForWidthSource,
  parseMediaWidthSources,
  pickMediaSource,
  resolveLayoutIconSources,
  resolveLayoutImageSources,
  resolveMediaUrl,
} from '@/lib/utils/cms-media';

describe('parseMediaWidthSources', () => {
  it('keeps entries with at least one width bound', () => {
    expect(
      parseMediaWidthSources([
        { mediaId: 'm', maxWidth: 767, url: 'https://cdn.example.com/m.webp' },
        { mediaId: 'd', minWidth: 768, url: 'https://cdn.example.com/d.webp' },
      ]),
    ).toHaveLength(2);
  });

  it('drops entries without minWidth or maxWidth', () => {
    expect(
      parseMediaWidthSources([{ mediaId: 'x', url: 'https://cdn.example.com/x.webp' }]),
    ).toEqual([]);
  });

  it('returns empty array for non-arrays', () => {
    expect(parseMediaWidthSources(null)).toEqual([]);
    expect(parseMediaWidthSources({})).toEqual([]);
  });
});

describe('mediaQueryForWidthSource', () => {
  it('builds min and max queries', () => {
    expect(mediaQueryForWidthSource({ minWidth: 768, maxWidth: 1279 })).toBe(
      '(min-width: 768px) and (max-width: 1279px)',
    );
  });

  it('builds a single bound query', () => {
    expect(mediaQueryForWidthSource({ maxWidth: 767 })).toBe('(max-width: 767px)');
  });
});

describe('pickMediaSource', () => {
  const content = {
    url: 'https://cdn.example.com/fallback.jpg',
    mediaType: 'image',
    alt: 'Campaign',
    sources: [
      {
        mediaId: 'mobile',
        maxWidth: 767,
        url: 'https://cdn.example.com/mobile.webp',
        mediaType: 'image',
      },
      {
        mediaId: 'desktop',
        minWidth: 768,
        url: 'https://cdn.example.com/desktop.webp',
        mediaType: 'image',
      },
    ],
  };

  it('returns the mobile source under its max width', () => {
    expect(pickMediaSource(content, 390).url).toBe('https://cdn.example.com/mobile.webp');
  });

  it('returns the desktop source at and above min width', () => {
    expect(pickMediaSource(content, 1280).url).toBe('https://cdn.example.com/desktop.webp');
  });

  it('falls back when no source matches', () => {
    expect(
      pickMediaSource(
        {
          url: 'https://cdn.example.com/fallback.jpg',
          sources: [
            { mediaId: 'only-mobile', maxWidth: 400, url: 'https://cdn.example.com/m.webp' },
          ],
        },
        900,
      ).url,
    ).toBe('https://cdn.example.com/fallback.jpg');
  });

  it('falls back when the matched source has no url', () => {
    expect(
      pickMediaSource(
        {
          imageUrl: 'https://cdn.example.com/fallback.jpg',
          sources: [{ mediaId: 'broken', maxWidth: 767 }],
        },
        320,
      ).imageUrl,
    ).toBe('https://cdn.example.com/fallback.jpg');
  });
});

describe('resolveLayoutImageSources / resolveLayoutIconSources', () => {
  it('prefers top-level image_sources', () => {
    expect(
      resolveLayoutImageSources({
        image_sources: [{ minWidth: 768, url: 'https://cdn.example.com/d.webp' }],
        extra_metadata: {
          image_sources: [{ maxWidth: 767, url: 'https://cdn.example.com/m.webp' }],
        },
      }),
    ).toEqual([{ minWidth: 768, url: 'https://cdn.example.com/d.webp' }]);
  });

  it('reads icon_sources from extra_metadata when top-level is missing', () => {
    expect(
      resolveLayoutIconSources({
        extra_metadata: {
          icon_sources: [{ maxWidth: 767, url: 'https://cdn.example.com/icon.webp' }],
        },
      }),
    ).toEqual([{ maxWidth: 767, url: 'https://cdn.example.com/icon.webp' }]);
  });
});

describe('encodeCmsMediaUrl', () => {
  it('percent-encodes spaces in the pathname for srcset safety', () => {
    expect(
      encodeCmsMediaUrl(
        'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Frame 2613201-781f0429.jpg',
      ),
    ).toBe('https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/07/Frame%202613201-781f0429.jpg');
  });

  it('does not double-encode already encoded segments', () => {
    expect(encodeCmsMediaUrl('https://cdn.example.com/cms/media/Frame%202613201.jpg')).toBe(
      'https://cdn.example.com/cms/media/Frame%202613201.jpg',
    );
  });
});

describe('resolveMediaUrl', () => {
  it('prefers url over imageUrl', () => {
    expect(resolveMediaUrl({ url: 'https://a', imageUrl: 'https://b' })).toBe('https://a');
  });

  it('returns null when empty', () => {
    expect(resolveMediaUrl({})).toBeNull();
  });
});
