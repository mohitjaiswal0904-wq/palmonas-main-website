import {
  buildCustomFitBootstrapScript,
  CUSTOMFIT_API_ORIGIN,
  CUSTOMFIT_PREINIT_SCRIPT_ID,
  CUSTOMFIT_SDK_SRC,
  shouldLoadCustomFit,
} from '@/lib/analytics/customfit-bootstrap';

describe('customfit-bootstrap', () => {
  it('exposes CustomFit SDK and API endpoints', () => {
    expect(CUSTOMFIT_API_ORIGIN).toBe('https://api.customfit.ai');
    expect(CUSTOMFIT_SDK_SRC).toBe(
      'https://sdk.customfit.ai/e92c8a30-97ae-11f1-ad9a-f901460c92a7/cf-js-sdk-min.js',
    );
  });

  it('uses the vendor preinit script id', () => {
    expect(CUSTOMFIT_PREINIT_SCRIPT_ID).toBe('customfitpreinit');
  });

  it('builds bootstrap that hides flash and loads the SDK', () => {
    const script = buildCustomFitBootstrapScript();
    expect(script).toContain('customfitpreinit');
    expect(script).toContain('customfit-invisible-preinit-block');
    expect(script).toContain('visibility:hidden');
    expect(script).toContain(CUSTOMFIT_SDK_SRC);
  });

  it('builds bootstrap that clears hide styles on SDK error', () => {
    const script = buildCustomFitBootstrapScript();
    expect(script).toContain('onerror');
    expect(script).toContain('customfitinit');
  });

  it('loads CustomFit on production hosts', () => {
    expect(shouldLoadCustomFit('production')).toBe(true);
  });

  it('skips CustomFit on localhost development', () => {
    expect(shouldLoadCustomFit('development')).toBe(false);
  });

  it('skips CustomFit on staging hosts', () => {
    expect(shouldLoadCustomFit('staging')).toBe(false);
  });

  it('skips CustomFit by default in the test env', () => {
    expect(shouldLoadCustomFit()).toBe(false);
  });
});
