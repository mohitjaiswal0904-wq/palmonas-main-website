/** Mobile-first breakpoint widths in pixels — keep in sync with tailwind.config.ts */
export const breakpoints = {
  'mini-mobile': 320,
  'mobile': 480,
  'tab': 768,
  'laptop': 1024,
  'desktop': 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Returns a min-width media query string for the given breakpoint. */
export function minWidthQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${breakpoints[breakpoint]}px)`;
}

/** Ordered from smallest to largest — useful for mobile-first iteration. */
export const breakpointOrder: Breakpoint[] = ['mini-mobile', 'mobile', 'tab', 'laptop', 'desktop'];
