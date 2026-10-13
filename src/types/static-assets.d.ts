/**
 * Static asset module declarations for `tsc --noEmit` in CI.
 *
 * `next-env.d.ts` (which references `next/image-types/global`) is gitignored and
 * only exists after a local Next.js run; without these declarations, SVG imports fail type-check.
 */
declare module '*.svg' {
  import type { StaticImageData } from 'next/image';

  const content: StaticImageData;
  export default content;
}

declare module '*.png' {
  import type { StaticImageData } from 'next/image';

  const content: StaticImageData;
  export default content;
}
