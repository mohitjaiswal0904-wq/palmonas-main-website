import type { CSSProperties } from 'react';

import type { FooterConfig } from '@/types/layout';

export interface FooterTheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
  surfaceColor: string;
  surfaceStrongColor: string;
  mutedTextColor: string;
}

const FALLBACK_BACKGROUND = '#111111';
const FALLBACK_TEXT = '#FFFFFF';
const FALLBACK_LINK = '#AAAAAA';

export function resolveFooterTheme(config: FooterConfig): FooterTheme {
  const textColor = config.heading_color ?? config.text_color ?? FALLBACK_TEXT;
  const backgroundColor = config.background_color ?? FALLBACK_BACKGROUND;
  const linkColor = config.link_color ?? FALLBACK_LINK;
  const mutedTextColor =
    config.muted_text_color ?? `color-mix(in srgb, ${textColor} 70%, transparent)`;
  const borderColor = config.border_color ?? `color-mix(in srgb, ${textColor} 15%, transparent)`;

  return {
    backgroundColor,
    textColor,
    linkColor,
    borderColor,
    surfaceColor: `color-mix(in srgb, ${textColor} 8%, transparent)`,
    surfaceStrongColor: `color-mix(in srgb, ${textColor} 12%, transparent)`,
    mutedTextColor,
  };
}

export function footerRootStyle(theme: FooterTheme): CSSProperties {
  return {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    ['--footer-bg' as string]: theme.backgroundColor,
    ['--footer-text' as string]: theme.textColor,
    ['--footer-link' as string]: theme.linkColor,
    ['--footer-border' as string]: theme.borderColor,
    ['--footer-surface' as string]: theme.surfaceColor,
    ['--footer-surface-strong' as string]: theme.surfaceStrongColor,
    ['--footer-muted' as string]: theme.mutedTextColor,
  };
}
