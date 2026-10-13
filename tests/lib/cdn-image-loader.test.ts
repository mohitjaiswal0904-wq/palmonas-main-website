import cdnImageLoader from '@/lib/cdn-image-loader';

describe('cdnImageLoader', () => {
  it('appends Shopify width and quality so the browser hits CDN directly', () => {
    const src =
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/ER148_1.png?v=1744526611';

    expect(cdnImageLoader({ src, width: 828, quality: 75 })).toBe(
      'https://cdn.shopify.com/s/files/1/0613/1400/7297/files/ER148_1.png?v=1744526611&width=828&quality=75',
    );
  });

  it('appends width for CloudFront so next/image custom loader is satisfied', () => {
    const src = 'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/hero.jpg';

    expect(cdnImageLoader({ src, width: 1200 })).toBe(`${src}?w=1200`);
  });

  it('passes through relative public paths', () => {
    expect(cdnImageLoader({ src: '/logo.svg', width: 64 })).toBe('/logo.svg');
  });

  it('defaults quality to 75 for Shopify', () => {
    const src = 'https://cdn.shopify.com/s/files/1/x/a.png';

    expect(cdnImageLoader({ src, width: 400 })).toContain('quality=75');
  });
});
