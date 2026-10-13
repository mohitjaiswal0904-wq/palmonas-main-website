import { Nunito_Sans as NunitoSans } from 'next/font/google';

/**
 * Shared Nunito Sans loader for the app.
 * Pair {@link themeFonts.sans} with Tailwind `font-normal` / `font-medium` / `font-semibold` / `font-bold`.
 * Do not call `next/font` again in feature components — import from here.
 */
const nunitoSans = NunitoSans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** Global theme font helpers — reuse instead of per-file `next/font`. */
export const themeFonts = {
  sans: nunitoSans,
} as const;
