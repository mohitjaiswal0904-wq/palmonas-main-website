/** @jest-environment jsdom */

import { LANDING_UTM_STORAGE_KEY } from '@/config/cart/cart.config';
import {
  applyUtmParamsToPageUrl,
  buildGokwikUtmCookieScript,
  captureLandingUtmParams,
  getStoredLandingUtmParams,
  parseUtmQueryParams,
  persistCheckoutUtmCookies,
  toCheckoutUtmSource,
  toGokwikUtmQueryString,
} from '@/lib/cart/checkout-utm-storage';

describe('checkout utm storage', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', 'http://localhost/cart');
    document.cookie.split(';').forEach((part) => {
      const key = part.split('=')[0]?.trim();
      if (key) {
        document.cookie = `${key}=; Max-Age=0; Path=/`;
      }
    });
  });

  it('parseUtmQueryParams extracts standard utm keys', () => {
    const params = parseUtmQueryParams(
      new URLSearchParams('utm_source=google&utm_medium=cpc&foo=bar'),
    );

    expect(params).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
    });
  });

  it('captureLandingUtmParams persists original UTMs and prefixes GoKwik cookies', () => {
    captureLandingUtmParams(
      new URLSearchParams('utm_source=meta&utm_campaign=monsoon&utm_content=hero'),
    );

    expect(JSON.parse(localStorage.getItem(LANDING_UTM_STORAGE_KEY) ?? '{}')).toEqual({
      utm_source: 'meta',
      utm_campaign: 'monsoon',
      utm_content: 'hero',
    });
    expect(decodeURIComponent(document.cookie)).toContain('utm_source=new_website_meta');
  });

  it('captureLandingUtmParams skips write when no utm keys present', () => {
    captureLandingUtmParams(new URLSearchParams('ref=home'));

    expect(localStorage.getItem(LANDING_UTM_STORAGE_KEY)).toBeNull();
  });

  it('getStoredLandingUtmParams returns saved map', () => {
    localStorage.setItem(
      LANDING_UTM_STORAGE_KEY,
      JSON.stringify({ utm_medium: 'email', utm_campaign: 'winback' }),
    );

    expect(getStoredLandingUtmParams()).toEqual({
      utm_medium: 'email',
      utm_campaign: 'winback',
    });
  });

  it('applyUtmParamsToPageUrl merges params onto current URL', () => {
    applyUtmParamsToPageUrl({
      utm_source: 'special_customer',
      utm_medium: 'email',
      utm_campaign: 'monsoon',
    });

    const url = new URL(window.location.href);
    expect(url.searchParams.get('utm_source')).toBe('special_customer');
    expect(url.searchParams.get('utm_medium')).toBe('email');
    expect(url.searchParams.get('utm_campaign')).toBe('monsoon');
  });

  it('applyUtmParamsToPageUrl skips replaceState when UTMs are already on the URL', () => {
    window.history.replaceState(
      {},
      '',
      'http://localhost/cart?utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
    );
    const replaceSpy = jest.spyOn(window.history, 'replaceState');

    applyUtmParamsToPageUrl({
      utm_source: 'new_website',
      utm_medium: 'web',
      utm_campaign: 'web_checkout',
    });

    expect(replaceSpy).not.toHaveBeenCalled();
    replaceSpy.mockRestore();
  });

  it('persistCheckoutUtmCookies writes standard utm cookies and gk_utm_source', () => {
    persistCheckoutUtmCookies({
      utm_source: 'new_website',
      utm_medium: 'web',
      utm_campaign: 'cftest',
    });

    expect(document.cookie).toContain('utm_source=new_website');
    expect(document.cookie).toContain('utm_medium=web');
    expect(document.cookie).toContain('utm_campaign=cftest');
    expect(decodeURIComponent(document.cookie)).toContain(
      'utm_source=new_website&utm_medium=web&utm_campaign=cftest',
    );
  });

  it('toGokwikUtmQueryString serialises keys in UTM order', () => {
    expect(
      toGokwikUtmQueryString({
        utm_campaign: 'cftest',
        utm_source: 'new_website',
        utm_medium: 'web',
      }),
    ).toBe('utm_source=new_website&utm_medium=web&utm_campaign=cftest');
  });

  it('toCheckoutUtmSource prefixes original sources for GoKwik', () => {
    expect(toCheckoutUtmSource(undefined)).toBe('new_website');
    expect(toCheckoutUtmSource('meta')).toBe('new_website_meta');
    expect(toCheckoutUtmSource('google')).toBe('new_website_google');
    expect(toCheckoutUtmSource('new_website')).toBe('new_website');
    expect(toCheckoutUtmSource('new_website_meta')).toBe('new_website_meta');
  });

  it('buildGokwikUtmCookieScript snapshots live URL UTMs into gk_utm_source', () => {
    const script = buildGokwikUtmCookieScript();
    expect(script).toContain('gk_utm_source');
    expect(script).toContain('utm_campaign');
    expect(script).toContain('gk_landing_page');
    expect(script).toContain("prefix + '_'");
  });

  it('toGokwikUtmQueryString returns empty when no utm values exist', () => {
    expect(toGokwikUtmQueryString({})).toBe('');
    expect(toGokwikUtmQueryString({ utm_source: '  ' })).toBe('');
  });
});
