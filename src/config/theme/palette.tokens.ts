/** Core brand palette — source of truth for CSS variables and Tailwind semantic colors. */
export const paletteTokens = {
  brand: {
    brown: '#3F3529',
    navy: '#1C2340',
    blush: '#F6E9F5',
    blushDark: '#EFDBE8',
    rose: '#F6C3D9',
    roseHover: '#F0B3CF',
    pinkAccent: '#EC4899',
    stoneMuted: '#78716C',
  },
  surface: {
    panel: '#F6E9F5',
    card: '#EFDBE8',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#1C2340',
    muted: '#78716C',
  },
  cta: {
    default: '#F6C3D9',
    hover: '#F0B3CF',
  },
  accent: {
    pink: '#EC4899',
  },
  border: {
    subtle: '#E7E5E4',
  },
} as const;

/** CSS custom properties derived from palette tokens (single source of truth). */
export const paletteCssVars = {
  '--color-brand-brown': paletteTokens.brand.brown,
  '--color-brand-navy': paletteTokens.brand.navy,
  '--color-surface-panel': paletteTokens.surface.panel,
  '--color-surface-card': paletteTokens.surface.card,
  '--color-surface-elevated': paletteTokens.surface.elevated,
  '--color-text-primary': paletteTokens.text.primary,
  '--color-text-muted': paletteTokens.text.muted,
  '--color-cta-default': paletteTokens.cta.default,
  '--color-cta-hover': paletteTokens.cta.hover,
  '--color-accent-pink': paletteTokens.accent.pink,
  '--color-border-subtle': paletteTokens.border.subtle,
} as const;
