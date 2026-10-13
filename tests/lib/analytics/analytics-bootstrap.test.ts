/** @jest-environment jsdom */

import {
  buildAdmitadScriptSrc,
  sanitizeAdmitadCampaignCode,
} from '@/lib/analytics/admitad-bootstrap';
import { buildGtmBootstrapScript, sanitizeGtmContainerId } from '@/lib/analytics/gtm-bootstrap';
import {
  buildPinterestBootstrapScript,
  sanitizePinterestTagId,
} from '@/lib/analytics/pinterest-bootstrap';
import {
  buildSpotifyBootstrapScript,
  sanitizeSpotifyPixelId,
} from '@/lib/analytics/spotify-bootstrap';

describe('analytics bootstrap helpers', () => {
  it('sanitizes Admitad campaign code and builds script src', () => {
    expect(sanitizeAdmitadCampaignCode(' abc-123 ')).toBe('abc-123');
    expect(buildAdmitadScriptSrc('abc-123')).toBe(
      'https://www.artfut.com/static/tagtag.min.js?campaign_code=abc-123',
    );
    expect(buildAdmitadScriptSrc('')).toBe('');
  });

  it('sanitizes GTM container id and builds bootstrap script', () => {
    expect(sanitizeGtmContainerId(' GTM-ABC123 ')).toBe('GTM-ABC123');
    expect(buildGtmBootstrapScript('GTM-ABC123')).toContain('GTM-ABC123');
    expect(buildGtmBootstrapScript('GTM-ABC123')).toContain('__palmonasGtmId');
    expect(buildGtmBootstrapScript('')).toBe('');
  });

  it('injects gtm.js only once when the bootstrap runs twice', () => {
    document.body.innerHTML = '<script id="seed"></script>';
    delete window.__palmonasGtmId;
    window.dataLayer = [];

    const script = buildGtmBootstrapScript('GTM-ABC123');
    // ponytail: evaluate the emitted loader the same way the inline Script tag does.
    window.eval(script);
    window.eval(script);

    expect(document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')).toHaveLength(1);
    expect(
      (window.dataLayer ?? []).filter(
        (entry) => typeof entry === 'object' && entry !== null && 'gtm.start' in entry,
      ),
    ).toHaveLength(1);
  });

  it('sanitizes Pinterest tag id and builds bootstrap script', () => {
    expect(sanitizePinterestTagId(' 2612345678901 ')).toBe('2612345678901');
    expect(buildPinterestBootstrapScript('2612345678901')).toContain(
      "pintrk('load','2612345678901')",
    );
    expect(buildPinterestBootstrapScript('')).toBe('');
  });

  it('sanitizes Spotify pixel id and builds bootstrap script', () => {
    expect(sanitizeSpotifyPixelId(' pixel-abc_1 ')).toBe('pixel-abc_1');
    expect(buildSpotifyBootstrapScript('pixel-abc_1')).toContain("spotify('init','pixel-abc_1')");
    expect(buildSpotifyBootstrapScript('')).toBe('');
  });
});
