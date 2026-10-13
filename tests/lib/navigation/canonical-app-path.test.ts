import {
  canonicalizeAppHref,
  canonicalizeAppPath,
} from '@/lib/navigation/canonical-app-path';

describe('canonicalizeAppPath', () => {
  it('maps legacy about CMS paths to /about', () => {
    expect(canonicalizeAppPath('/pages/about-us')).toBe('/about');
    expect(canonicalizeAppPath('/page/about')).toBe('/about');
  });

  it('maps legacy FAQ path to /pages/faqs', () => {
    expect(canonicalizeAppPath('/pages/faq')).toBe('/pages/faqs');
  });

  it('maps legacy warranty and buy-back footer paths', () => {
    expect(canonicalizeAppPath('/pages/lifetime-warranty-policy')).toBe('/pages/warranty-page');
    expect(canonicalizeAppPath('/pages/lifetime-buyback-policy')).toBe('/pages/lifetime-buy-back-policy');
  });

  it('returns unknown paths unchanged', () => {
    expect(canonicalizeAppPath('/collections/new-arrivals')).toBe('/collections/new-arrivals');
  });
});

describe('canonicalizeAppHref', () => {
  it('canonicalizes pathname and preserves search', () => {
    expect(canonicalizeAppHref('/pages/about-us?ref=nav')).toBe('/about?ref=nav');
  });

  it('returns unparseable hrefs unchanged', () => {
    expect(canonicalizeAppHref('mailto:support@palmonas.com')).toBe('mailto:support@palmonas.com');
  });
});
