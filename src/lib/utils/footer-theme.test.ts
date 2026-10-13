import { resolveFooterTheme } from '@/lib/utils/footer-theme';
import type { FooterConfig } from '@/types/layout';

describe('resolveFooterTheme', () => {
  it('uses colours from the CMS API config', () => {
    const config: FooterConfig = {
      background_color: '#111111',
      text_color: '#FFFFFF',
      link_color: '#AAAAAA',
    };

    expect(resolveFooterTheme(config)).toMatchObject({
      backgroundColor: '#111111',
      textColor: '#FFFFFF',
      linkColor: '#AAAAAA',
    });
  });

  it('derives border and muted tones from the API text colour', () => {
    const theme = resolveFooterTheme({
      text_color: '#FFFFFF',
    });

    expect(theme.borderColor).toBe('color-mix(in srgb, #FFFFFF 15%, transparent)');
    expect(theme.mutedTextColor).toBe('color-mix(in srgb, #FFFFFF 70%, transparent)');
  });

  it('prioritises heading_color over text_color for textColor', () => {
    const theme = resolveFooterTheme({
      heading_color: '#222222',
      text_color: '#FFFFFF',
    });

    expect(theme.textColor).toBe('#222222');
  });
});
