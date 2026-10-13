import type { CSSProperties } from 'react';

import type { HeaderConfig } from '@/types/layout';

export interface HeaderTheme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
}

const FALLBACK_BACKGROUND = 'rgba(255, 255, 255, 0.9)';
const FALLBACK_TEXT = '#151515';
const FALLBACK_LINK = '#151515';
const FALLBACK_BORDER = '#E7E5E4';

export function resolveHeaderTheme(config: HeaderConfig): HeaderTheme {
  const textColor = config.text_color ?? FALLBACK_TEXT;
  const backgroundColor = config.background_color ?? FALLBACK_BACKGROUND;
  const linkColor = config.link_color ?? FALLBACK_LINK;

  return {
    backgroundColor,
    textColor,
    linkColor,
    borderColor: config.border_color ?? FALLBACK_BORDER,
  };
}

export function headerRootStyle(theme: HeaderTheme): CSSProperties {
  return {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderColor: theme.borderColor,
    ['--header-bg' as string]: theme.backgroundColor,
    ['--header-text' as string]: theme.textColor,
    ['--header-link' as string]: theme.linkColor,
    ['--header-border' as string]: theme.borderColor,
  };
}
