import { themeFonts } from '@/config/theme/fonts';

describe('themeFonts', () => {
  it('exposes a shared Nunito Sans className', () => {
    expect(themeFonts.sans.className).toEqual(expect.any(String));
    expect(themeFonts.sans.className.length).toBeGreaterThan(0);
  });

  it('exposes a CSS variable for optional global wiring', () => {
    expect(themeFonts.sans.style).toBeDefined();
  });
});
