/**
 * POP feature UI tokens (Figma-aligned).
 * Hex values are also mirrored as CSS vars under `.pop-page` in `src/styles/pop.css`.
 */
export const popTokens = {
  timeline: '#d1d5dc',
  /** Vertical How It Works joint bar — solid at icon, fades out (Figma 60:1053 / 60:1066 / 60:1080). */
  timelinePipelineGradient: 'linear-gradient(to bottom, #d1d5dc 0%, rgba(0, 0, 0, 0) 100%)',
  howItWorksBadgePx: 38,
  howItWorksPipelineHeightPx: 85,
  /** Mobile How It Works step card min height (Figma 60:1054 ≈ 98px). */
  howItWorksCardMinHeightPx: 98,
} as const;
